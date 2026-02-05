#!/usr/bin/env python3
"""
Google Apps Script 部署工具
"""
import os
import json
import time
import subprocess

SCRIPT_ID = "AKfycbwtBYl3LNMhsVYrgLMmFWu1XEt--MydD-tpgl0LKZPJwxLtP2p1cHiZUeorEyIzQsb7"
PROJECT_DIR = "/root/.openclaw/workspace/customer-tracker"

def check_clasp():
    """检查 clasp 是否可用"""
    try:
        result = subprocess.run(['which', 'clasp'], capture_output=True, text=True)
        return result.returncode == 0
    except:
        return False

def install_clasp():
    """安装 clasp"""
    print("📦 正在安装 clasp...")
    os.system("npm install -g @google/clasp")

def clasp_login():
    """登录 clasp"""
    print("🔐 请在浏览器中完成 Google 登录...")
    os.system("npx @google/clasp login --no-localhost")

def deploy_gas():
    """部署 GAS 代码"""
    os.chdir(PROJECT_DIR)
    
    # 推送代码到 clasp
    print("📤 推送代码到 Apps Script...")
    result = os.system("npx @google/clasp push")
    
    if result != 0:
        print("❌ 推送失败")
        return False
    
    # 创建部署
    print("🚀 创建新部署...")
    result = os.system(f'npx @google/clasp deploy --description "V2 更新"')
    
    if result == 0:
        print("✅ 部署成功！")
        return True
    else:
        print("❌ 部署失败")
        return False

def main():
    print("🔧 Google Apps Script 自动部署工具")
    print("=" * 50)
    
    # 检查 clasp
    if not check_clasp():
        install_clasp()
    
    # 检查是否已登录
    if not os.path.exists(os.path.expanduser("~/.clasprc.json")):
        print("\n📝 首次使用需要登录 Google")
        clasp_login()
    
    # 部署
    deploy_gas()

if __name__ == "__main__":
    main()
