# 🚨 GitHub OAuth 登录问题修复指南

## 问题症状
- 点击 GitHub 登录 → 成功跳转到 GitHub
- 在 GitHub 授权 → 跳回应用但显示错误
- 错误：`OAUTH_CALLBACK_ERROR` 和 `outgoing request timed out`

## 🔍 问题原因
1. **网络连接问题**：无法访问 `api.github.com`
2. **OAuth 回调 URL 配置问题**
3. **NextAuth 超时设置过短**

## 🔧 解决步骤

### 步骤1：检查 GitHub OAuth 应用设置
1. 登录 GitHub.com
2. 进入 Settings → Developer settings → OAuth Apps
3. 点击你的应用 "AI Image Generator"
4. 确认以下设置：

```
Application name: AI Image Generator
Homepage URL: http://localhost:3000
Authorization callback URL: http://localhost:3000/api/auth/callback/github
```

⚠️ **注意**：回调 URL 必须完全匹配，包括协议 `http://`

### 步骤2：验证环境变量
确认 .env 文件中的配置：
```env
GITHUB_CLIENT_ID="Ov23liuHayvDplQkMRR5"
GITHUB_CLIENT_SECRET="23baee85c615f195fe310e9c1f8472ed43481d24"
NEXTAUTH_URL="http://localhost:3000"
```

### 步骤3：网络测试
```bash
# 测试 GitHub API 连接
Test-NetConnection -ComputerName "api.github.com" -Port 443
```

如果连接失败，说明网络环境限制了 GitHub API 访问。

## 🌐 网络解决方案

### 选项A：使用代理或 VPN
如果你有可用的网络代理或 VPN，启用后重试登录。

### 选项B：切换到邮箱登录（推荐）
添加邮箱登录功能，不依赖第三方 OAuth：

```typescript
// 在 NextAuth 配置中添加 Email Provider
import EmailProvider from "next-auth/providers/email"

providers: [
  EmailProvider({
    server: process.env.EMAIL_SERVER,
    from: process.env.EMAIL_FROM,
  }),
  // ... 其他 providers
]
```

### 选项C：使用其他 OAuth 提供商
考虑添加国内可访问的 OAuth 提供商，如：
- 微信登录
- QQ 登录
- 钉钉登录

## 🔄 重启应用
配置修改后，重启开发服务器：
```bash
npm run dev
```

## 📞 快速测试
修复后可以通过以下方式测试：
1. 访问 http://localhost:3000/api/auth/providers
2. 查看是否返回 GitHub provider
3. 尝试登录流程