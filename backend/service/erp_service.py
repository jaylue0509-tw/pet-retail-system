import csv
import io
import re
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from repository import pet_repo, store_repo
from model import models


def _parse_product_name(product_name: str) -> tuple:
    """
    解析品名欄位，例如「金吉拉貓-公銀白色」或「柴犬-母黑褐色」
    回傳 (category, breed, color)
    """
    parts = product_name.split('-')
    main = parts[0].strip()
    extra = parts[1].strip() if len(parts) > 1 else ''

    # 判斷犬/貓分類
    if '貓' in main:
        category = '貓'
        breed = main.replace('貓', '').strip()
    elif '犬' in main or '狗' in main:
        category = '犬'
        breed = re.sub(r'[犬狗]', '', main).strip()
    else:
        # 無法判斷，預設為犬
        category = '犬'
        breed = main

    # 從第二段解析毛色（去除性別前綴「公」「母」及任何多餘的反斜線字元）
    color = ''
    if extra:
        if extra[0] in ('公', '母'):
            color = extra[1:].strip()
        else:
            color = extra.strip()
    # NOTE：清除 ERP 匯出時帶入的反斜線前綴（例如 \銀色 → 銀色）
    color = color.lstrip('\\').strip()

    return category, breed, color


def _normalize_chip_number(chip_str: str) -> str | None:
    """
    處理 Excel 匯出時晶片號碼變成科學記號的問題
    例如 '9.00073001080124E+14' → '900073001080124'
    """
    chip_str = chip_str.strip()
    if not chip_str:
        return None
    try:
        # 科學記號格式
        if 'E' in chip_str.upper():
            val = float(chip_str)
            return str(int(val))
        return chip_str
    except Exception:
        return chip_str if chip_str else None


def _parse_date(date_str: str) -> str:
    """
    統一日期格式，支援 YYYY/M/D、YYYY/MM/DD、YYYY-MM-DD
    回傳標準 YYYY-MM-DD 字串
    """
    date_str = date_str.strip()
    if not date_str:
        return datetime.now().strftime('%Y-%m-%d')
    try:
        # 統一轉為斜線分隔後拆解
        parts = date_str.replace('-', '/').split('/')
        if len(parts) == 3:
            return f"{int(parts[0]):04d}-{int(parts[1]):02d}-{int(parts[2]):02d}"
    except Exception:
        pass
    return date_str


def _detect_format(header: list[str]) -> str:
    """
    依據 CSV 表頭自動判斷格式：
    'etipets' = 您的實際 ERP 格式（含品名、天數、成本等）
    'legacy'  = 舊版自訂格式
    """
    header_str = ','.join(header)
    if '品名' in header_str or '天數' in header_str or '店倉名稱' in header_str:
        return 'etipets'
    return 'legacy'


def import_csv_data(db: Session, file_content: bytes, current_username: str):
    """
    通用匯入入口：自動偵測 CSV 格式，轉發至對應的解析器
    """
    decoded = file_content.decode('utf-8-sig')
    reader = csv.reader(io.StringIO(decoded))
    header = next(reader, None)
    if not header:
        raise ValueError('CSV 檔案為空或缺少表頭')

    fmt = _detect_format(header)
    rows = list(reader)

    if fmt == 'etipets':
        return _import_etipets_format(db, header, rows, current_username)
    else:
        return _import_legacy_format(db, rows, current_username)


def _import_etipets_format(db: Session, header: list, rows: list, current_username: str):
    """
    解析您的真實 ERP 報表格式
    欄位：店倉 | 店倉名稱 | 活體編號 | 品名 | 晶片號碼 | 性別 | 等級 | 出生日期 | 天數 | 成本
    """
    # 建立動態欄位對應
    col = {name.strip(): idx for idx, name in enumerate(header)}

    added_count = 0
    updated_count = 0
    skipped_count = 0
    errors = []

    for line_no, row in enumerate(rows, start=2):
        if not row:
            skipped_count += 1
            continue

        try:
            def get(col_name: str, default: str = '') -> str:
                idx = col.get(col_name)
                if idx is None or idx >= len(row):
                    return default
                return row[idx].strip()

            store_name = get('店倉名稱')
            pet_code = get('活體編號')
            product_name = get('品名')
            chip_raw = get('晶片號碼')
            gender = get('性別')
            birth_date_raw = get('出生日期')
            days_str = get('天數', '0')
            cost_str = get('成本', '0').replace(',', '')

            if not pet_code or not store_name:
                skipped_count += 1
                continue

            # 解析品名
            category, breed, color = _parse_product_name(product_name)

            # 晶片號碼處理
            chip_number = _normalize_chip_number(chip_raw)

            # 日期格式轉換
            birth_date = _parse_date(birth_date_raw)

            # 進貨日期 = 今天 - 在庫天數
            try:
                days_in_store = int(days_str)
            except ValueError:
                days_in_store = 0
            entry_date = (datetime.now() - timedelta(days=days_in_store)).strftime('%Y-%m-%d')

            # 售價使用成本欄位
            try:
                price = int(float(cost_str)) if cost_str else 0
            except ValueError:
                price = 0

            # 查找門市（使用模糊比對）
            store = store_repo.get_store_by_name(db, store_name)
            if not store:
                errors.append(f'第 {line_no} 行：找不到門市「{store_name}」，請確認門市名稱已建立')
                skipped_count += 1
                continue

            # 處理活體編號重複的問題：先用晶片找，再用 (編號前綴 + 品種 + 毛色) 找
            db_pet = None
            if chip_number:
                db_pet = pet_repo.get_pet_by_chip(db, chip_number)
            
            original_pet_code = pet_code
            if not db_pet:
                db_pets = db.query(models.Pet).filter(
                    models.Pet.pet_code.like(f"{original_pet_code}%"),
                    models.Pet.breed == breed,
                    models.Pet.color == color
                ).all()
                if db_pets:
                    db_pet = db_pets[0]

            if db_pet:
                db_pet.store_id = store.id
                db_pet.category = category
                db_pet.breed = breed
                db_pet.gender = gender
                db_pet.color = color
                db_pet.birth_date = birth_date
                if chip_number:
                    db_pet.chip_number = chip_number
                db_pet.entry_date = entry_date
                db_pet.price = price
                db_pet.updated_at = datetime.utcnow()
                db_pet.updated_by = current_username
                updated_count += 1
            else:
                # 確保 pet_code 在資料庫唯一
                existing = pet_repo.get_pet_by_code(db, pet_code)
                if existing:
                    counter = 1
                    while True:
                        new_code = f"{original_pet_code}-{counter}"
                        if not pet_repo.get_pet_by_code(db, new_code):
                            pet_code = new_code
                            break
                        counter += 1

                new_pet = models.Pet(
                    pet_code=pet_code,
                    store_id=store.id,
                    category=category,
                    breed=breed,
                    gender=gender,
                    color=color,
                    birth_date=birth_date,
                    chip_number=chip_number,
                    entry_date=entry_date,
                    price=price,
                    supplier=None,
                    status='在庫',
                    publish_status='上架中',  # NOTE：ERP 匯入的活體已確認在庫，直接設為上架中
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    created_by=current_username
                )
                pet_repo.create_pet(db, new_pet)
                added_count += 1

        except Exception as e:
            errors.append(f'第 {line_no} 行發生錯誤：{str(e)}')
            skipped_count += 1

    db.commit()

    return {
        'added': added_count,
        'updated': updated_count,
        'skipped': skipped_count,
        'errors': errors
    }


def _import_legacy_format(db: Session, rows: list, current_username: str):
    """
    舊版自訂 CSV 格式
    欄位：活體編號 | 犬貓分類 | 品種 | 性別 | 毛色 | 出生日期 | 晶片號碼 | 進貨日期 | 建議售價 | 供應商 | 門市名稱 | 狀態
    """
    added_count = 0
    updated_count = 0
    skipped_count = 0
    errors = []

    for idx, row in enumerate(rows, start=2):
        if not row or len(row) < 12:
            skipped_count += 1
            continue

        try:
            pet_code = row[0].strip()
            category = row[1].strip()
            breed = row[2].strip()
            gender = row[3].strip()
            color = row[4].strip()
            birth_date = _parse_date(row[5].strip())
            chip_number = _normalize_chip_number(row[6].strip())
            entry_date = _parse_date(row[7].strip())
            price = int(row[8].strip().replace(',', '') or 0)
            supplier = row[9].strip() or None
            store_name = row[10].strip()
            status_str = row[11].strip()

            if not pet_code or not store_name:
                skipped_count += 1
                continue

            store = store_repo.get_store_by_name(db, store_name)
            if not store:
                errors.append(f'第 {idx} 行：找不到門市「{store_name}」')
                skipped_count += 1
                continue

            db_pet = pet_repo.get_pet_by_code(db, pet_code)
            if db_pet:
                db_pet.store_id = store.id
                db_pet.category = category
                db_pet.breed = breed
                db_pet.gender = gender
                db_pet.color = color
                db_pet.birth_date = birth_date
                db_pet.chip_number = chip_number
                db_pet.entry_date = entry_date
                db_pet.price = price
                db_pet.supplier = supplier
                db_pet.status = status_str
                db_pet.updated_at = datetime.utcnow()
                db_pet.updated_by = current_username

                if status_str in ['已成交', '已退貨'] and db_pet.publish_status != '已下架':
                    status_log = models.PetStatusLog(
                        pet_code=db_pet.pet_code,
                        operator=current_username,
                        old_status=db_pet.publish_status,
                        new_status='已下架',
                        unpublish_reason='已成交' if status_str == '已成交' else '其他',
                        unpublish_note='ERP自動同步下架',
                        created_at=datetime.utcnow()
                    )
                    pet_repo.create_pet_status_log(db, status_log)
                    db_pet.publish_status = '已下架'

                updated_count += 1
            else:
                new_pet = models.Pet(
                    pet_code=pet_code,
                    store_id=store.id,
                    category=category,
                    breed=breed,
                    gender=gender,
                    color=color,
                    birth_date=birth_date,
                    chip_number=chip_number,
                    entry_date=entry_date,
                    price=price,
                    supplier=supplier,
                    status=status_str,
                    publish_status='草稿',
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    created_by=current_username
                )
                pet_repo.create_pet(db, new_pet)
                added_count += 1

        except Exception as e:
            errors.append(f'第 {idx} 行異常：{str(e)}')
            skipped_count += 1

    db.commit()

    return {
        'added': added_count,
        'updated': updated_count,
        'skipped': skipped_count,
        'errors': errors
    }
