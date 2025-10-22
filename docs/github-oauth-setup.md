# GitHub OAuth 设置指南 (推荐方案)

## 🎯 为什么选择 GitHub OAuth？
- ✅ 在中国大陆可以正常访问
- ✅ 设置简单快速
- ✅ 用户体验良好
- ✅ 开发者常用平台

## 🔧 创建 GitHub OAuth 应用

### 第一步：访问 GitHub Settings
1. 打开 [GitHub.com](https://github.com/) 并登录
2. 点击右上角头像 → **Settings**
3. 在左侧菜单中找到 **Developer settings**
4. 点击 **OAuth Apps**

### 第二步：创建新应用
1. 点击 **"New OAuth App"** 按钮
2. 填写应用信息：

```
Application name: AI Image Generator
Homepage URL: http://localhost:3000
Application description: AI图像和视频生成器
Authorization callback URL: http://localhost:3000/api/auth/callback/github
```

### 第三步：获取凭据
创建完成后，你会看到：
- **Client ID** (类似: Iv1.a1b2c3d4e5f6g7h8)
- **Client Secret** (点击 "Generate a new client secret" 生成)

### 第四步：更新 .env 文件
```env
## GitHub OAuth (推荐 - 在中国大陆可正常使用)
GITHUB_CLIENT_ID="你的GitHub Client ID"
GITHUB_CLIENT_SECRET="你的GitHub Client Secret"
```

### 第五步：重启应用
```bash
npm run dev
```

## 🌐 生产环境配置

当你部署到生产环境时，需要：

1. 在 GitHub OAuth App 设置中添加生产环境回调 URL：
```
https://yourdomain.com/api/auth/callback/github
```

2. 更新 .env 中的 NEXTAUTH_URL：
```env
NEXTAUTH_URL="https://yourdomain.com"
```

## 🔄 测试登录

设置完成后：
1. 重启开发服务器
2. 访问 http://localhost:3000
3. 点击 "使用 GitHub 登录" 按钮
4. 授权后应该能成功登录

## 📝 注意事项

- GitHub Client Secret 只显示一次，请妥善保存
- 确保回调 URL 完全匹配（包括协议、域名、端口）
- 开发环境和生产环境需要分别配置不同的回调 URL