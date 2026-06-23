# -*- coding: utf-8 -*-
import pytest
from playwright.sync_api import Page, expect

def test_flagship_store_navigation(page: Page):
    """
    測試前台首頁的門市展示與區域篩選 (採用執照編號與電話等 ASCII 字元避開中文亂碼問題)
    """
    # 1. 導覽至首頁
    page.goto("http://localhost:5173/")
    
    # 2. 等待門市列表加載完畢
    page.wait_for_selector(".grid", timeout=5000)
    
    # 3. 篩選「北部地區」 (第一個 select 下拉選單選擇 value="north")
    page.select_option("select:first-of-type", "north")
    
    # 4. 藉由曼哈頓店的特寵執照「A1070001」與電話「02-2781-5203」驗證店卡片是否成功渲染
    expect(page.locator("text=A1070001")).to_be_visible()
    expect(page.locator("text=02-2781-5203")).to_be_visible()

def test_feature_input_validation(page: Page):
    """
    測試後台編輯補充資料時的特色字數防呆限制 (使用 ASCII/CSS 選擇器定位與英文輸入)
    """
    # 1. 前往後台並登入為 admin
    page.goto("http://localhost:5173/admin")
    page.fill("input[type='text']", "admin")
    page.fill("input[type='password']", "admin123")
    page.click("button.btn-primary")
    
    # 2. 等待後台導覽列加載，並點選第二個連結「門市活體管理」 (避開 text=中文)
    page.wait_for_selector(".sidebar-nav", timeout=5000)
    page.click(".sidebar-nav a:nth-child(2)")
    
    # 3. 找到「D112001」行，並點選第一個按鈕 (編輯)
    page.wait_for_selector("tr:has-text('D112001')", timeout=5000)
    page.click("tr:has-text('D112001') >> button:first-of-type")
    
    # 4. 驗證 Modal 開啟且包含 D112001
    expect(page.locator(".modal-title:has-text('D112001')")).to_be_visible()
    
    # 5. 輸入長度不足 50 字元的英文特色說明 (長度為 30) (使用 row=3 的 textarea 定位)
    features_textarea = page.locator("textarea[rows='3']")
    features_textarea.fill("Short english features description.")
    
    # 6. 驗證儲存按鈕被鎖定 (modal-footer 下的第二個 button)
    save_button = page.locator(".modal-footer button:nth-child(2)")
    expect(save_button).to_be_disabled()
    
    # 7. 填入合規長度的英文特色說明 (長度為 70)
    valid_text = "This is a very lovely and friendly puppy. It is very active and loves playing with people."
    features_textarea.fill(valid_text)
    
    # 8. 驗證按鈕已啟用，點擊儲存並接受 Dialog
    expect(save_button).to_be_enabled()
    page.on("dialog", lambda dialog: dialog.accept())
    save_button.click()

def test_store_isolation_and_role_permissions(page: Page):
    """
    測試店長管理隔離與權限限制
    """
    # 1. 登入曼哈頓店長 (manhattan / store123)
    page.goto("http://localhost:5173/admin")
    page.fill("input[type='text']", "manhattan")
    page.fill("input[type='password']", "store123")
    page.click("button.btn-primary")
    
    # 2. 切換至門市活體管理 (第二個連結)
    page.wait_for_selector(".sidebar-nav", timeout=5000)
    page.click(".sidebar-nav a:nth-child(2)")
    
    # 3. 驗證只出現本店活體 D112001 與 C112002
    page.wait_for_selector("tr:has-text('D112001')", timeout=5000)
    expect(page.locator("tr:has-text('D112001')")).to_be_visible()
    expect(page.locator("tr:has-text('C112002')")).to_be_visible()
    
    # 4. 驗證看不到其他門市的 D112003
    expect(page.locator("tr:has-text('D112003')")).not_to_be_visible()
    
    # 5. 驗證側邊欄沒有第三個連結「ERP 資料同步匯入」 (店長側邊欄只有 2 個 a 連結)
    expect(page.locator(".sidebar-nav a:nth-child(3)")).not_to_be_visible()

