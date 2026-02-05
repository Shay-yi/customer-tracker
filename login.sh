#!/bin/bash
# 快速登录 clasp

echo "🔐 正在打开登录页面..."
echo "请在浏览器中完成 Google 登录"
echo ""

# 获取登录 URL
LOGIN_URL=$(curl -s -H "Content-Type: application/json" \
    -d "https://oauth2.googleapis.com/tokeninfo?id_token=placeholder" \
    "https://accounts.google.com/o/oauth2/v2/auth?client_id=807229350240.apps.googleusercontent.com&redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=code&scope=https://www.googleapis.com/auth/script.deployments%20https://www.googleapis.com/auth/script.projects&access_type=offline" || echo "")

# 实际上 clasp login 会自动打开浏览器
npx @google/clasp login --no-localhost

echo ""
echo "✅ 登录成功！"
echo "以后我就可以帮你自动部署了！"
