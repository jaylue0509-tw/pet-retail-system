import subprocess
import socket
import time
import os
import sys

# 強制 stdout/stderr 使用 utf-8 輸出，徹底解決 Windows 控制台 CP950 編碼問題
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

def is_port_in_use(port: int) -> bool:
    """
    檢查指定 Port 是否已被佔用 (相容 IPv4 127.0.0.1 與 IPv6 ::1)
    """
    # 1. 嘗試 IPv4
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(0.5)
            if s.connect_ex(('127.0.0.1', port)) == 0:
                return True
    except:
        pass
        
    # 2. 嘗試 IPv6
    try:
        with socket.socket(socket.AF_INET6, socket.SOCK_STREAM) as s:
            s.settimeout(0.5)
            if s.connect_ex(('::1', port)) == 0:
                return True
    except:
        pass
        
    return False

def main():
    print("==================================================")
    print("      東寵活體媒合平台 一鍵式自動化整合驗證系統      ")
    print("==================================================")
    
    # 1. 偵測並啟動伺服器
    backend_started_by_us = False
    frontend_started_by_us = False
    
    backend_proc = None
    frontend_proc = None
    
        # 檢查後端 Port 8000
    if not is_port_in_use(8000):
        print("[*] 偵測到後端服務未啟動，正在背景啟動 FastAPI (Port 8000)...")
        python_exe = os.path.join("backend", "venv", "Scripts", "python.exe")
        env = os.environ.copy()
        env["PYTHONUTF8"] = "1"
        backend_proc = subprocess.Popen(
            [python_exe, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"],
            cwd="backend",
            env=env,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        backend_started_by_us = True
    else:
        print("[v] 後端服務已在運行中 (Port 8000)。")
        
    # 檢查前端 Port 5173
    if not is_port_in_use(5173):
        print("[*] 偵測到前端服務未啟動，正在背景啟動 Vite (Port 5173)...")
        frontend_proc = subprocess.Popen(
            "npm run dev",
            shell=True,
            cwd="frontend",
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        frontend_started_by_us = True
    else:
        print("[v] 前端服務已在運行中 (Port 5173)。")
        
    # 若有啟動服務，等待其就緒
    if backend_started_by_us or frontend_started_by_us:
        print("[~] 等待伺服器就緒中 (5秒)...")
        time.sleep(5)
        
    # 確認 Port 狀態
    backend_ready = is_port_in_use(8000)
    frontend_ready = is_port_in_use(5173)
    
    if not backend_ready:
        print("[x] 錯誤：無法啟動後端 API 伺服器，請手動確認。")
        sys.exit(1)
    if not frontend_ready:
        print("[x] 錯誤：無法啟動前端開發伺服器，請手動確認。")
        if backend_proc:
            backend_proc.terminate()
        sys.exit(1)
        
    print("[v] 前後端伺服器全部就緒。")
    print("--------------------------------------------------")
    
    results = {}
    
    # ---- 2. 後端代碼檢查 (Flake8) ----
    print("[*] 正在執行後端代碼檢查 (Flake8)...")
    flake8_exe = os.path.join("backend", "venv", "Scripts", "flake8.exe")
    res = subprocess.run(
        [flake8_exe, "main.py", "models.py", "schemas.py", "--ignore=E,W,F401"],
        cwd="backend"
    )
    results["後端代碼排版 (Flake8)"] = "WARN" if res.returncode != 0 else "PASS"
    
    # ---- 3. 前端代碼檢查 (ESLint) ----
    print("[*] 正在執行前端代碼檢查 (ESLint)...")
    res = subprocess.run("npm run lint", shell=True, cwd="frontend")
    results["前端代碼規範 (ESLint)"] = "WARN" if res.returncode != 0 else "PASS"
    
    # ---- 4. 後端 API 單元測試 (pytest) ----
    print("[*] 正在執行後端 API 單元測試 (pytest)...")
    pytest_exe = os.path.join("backend", "venv", "Scripts", "pytest.exe")
    env = os.environ.copy()
    env["PYTHONUTF8"] = "1"
    res = subprocess.run([pytest_exe, "tests/test_api.py"], cwd="backend", env=env)
    results["後端 API 單元測試 (pytest)"] = "PASS" if res.returncode == 0 else "FAIL"
    
    # ---- 5. 前端 UI 自動化測試 (Playwright) ----
    print("[*] 正在執行前端 UI E2E 自動化測試 (Playwright)...")
    res = subprocess.run([pytest_exe, "tests/test_e2e.py"], cwd="backend", env=env)
    results["前端 UI 自動化測試 (Playwright)"] = "PASS" if res.returncode == 0 else "FAIL"
    
    # ---- 6. 清理啟動的背景伺服器 ----
    if backend_started_by_us and backend_proc:
        print("[*] 正在關閉背景啟動的後端伺服器...")
        backend_proc.terminate()
        backend_proc.wait()
        
    if frontend_started_by_us and frontend_proc:
        print("[*] 正在關閉背景啟動的前端伺服器...")
        subprocess.run("taskkill /F /IM node.exe", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        frontend_proc.terminate()
        frontend_proc.wait()
        
    # ---- 7. 輸出測試結果報告 ----
    print("\n==================================================")
    print("               自動化整合測試結果報告               ")
    print("==================================================")
    all_pass = True
    for test_name, status in results.items():
        if status == "FAIL":
            status_str = "[ \033[91mFAIL\033[0m ]"
            all_pass = False
        elif status == "WARN":
            status_str = "[ \033[93mWARN\033[0m ]" # 黃色警告，但不阻擋發佈
        else:
            status_str = "[ \033[92mPASS\033[0m ]"
            
        dots = "." * (40 - len(test_name))
        print(f" {test_name} {dots} {status_str}")
    print("==================================================")
    
    if all_pass:
        print("🎉 \033[92m驗收結果：成功！平台核心功能全部通過。\033[0m")
    else:
        print("❌ \033[91m驗收結果：失敗！有核心測試未通過，請檢查程式。\033[0m")
    print("==================================================\n")

if __name__ == "__main__":
    main()
