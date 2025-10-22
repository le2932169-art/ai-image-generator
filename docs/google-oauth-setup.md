# Google OAuth 设置指南

## 🔧 创建 Google OAuth 应用

### 第一步：访问 Google Cloud Console
1. 打开 [Google Cloud Console](https://console.cloud.google.com/)
2. 登录你的 Google 账号
3. 创建新项目或选择现有项目

### 第二步：启用 Google+ API
1. 在左侧菜单中，点击 "APIs & Services" > "Library"
2. 搜索 "Google+ API" 
3. 点击启用

### 第三步：创建 OAuth 2.0 凭据
1. 在左侧菜单中，点击 "APIs & Services" > "Credentials"
2. 点击 "Create Credentials" > "OAuth 2.0 Client IDs"
3. 选择应用类型为 "Web Application"
4. 设置名称：比如 "AI Image Generator"

### 第四步：配置重定向 URI
**授权的重定向 URI：**
```
http://localhost:3000/api/auth/callback/google
```

**如果部署到生产环境，还需要添加：**
```
https://yourdomain.com/api/auth/callback/google
```

### 第五步：获取凭据
创建完成后，你会得到：
- Client ID (类似: 123456789-abc.apps.googleusercontent.com)
- Client Secret (类似: GOCSPX-abc123def456)

### 第六步：更新 .env 文件
```env
GOOGLE_CLIENT_ID="你的真实Client ID"
GOOGLE_CLIENT_SECRET="你的真实Client Secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/callback/google"
```

## 🌐 网络连接测试

如果创建了真实凭据仍然有问题，可能是网络连接问题。

### 测试 Google 连接：
```bash
curl -I https://accounts.google.com/.well-known/openid_configuration
```

### 如果在中国大陆：
Google 服务可能被网络限制，需要：
1. 使用 VPN 或代理
2. 或者使用其他 OAuth 提供商（如 GitHub）

## 🔄 重启应用
更新凭据后：
```bash
npm run dev
```