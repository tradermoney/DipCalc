# GitHub Pages 部署指南

本指南说明如何将 DipCalc 应用部署到 GitHub Pages。

## 📋 前提条件

1. **GitHub 仓库**：代码已推送到 GitHub
2. **仓库设置**：GitHub 仓库已配置 Pages 功能

## 🚀 自动部署设置

### 1. GitHub Actions 工作流

项目已配置 GitHub Actions 自动部署工作流：
- **文件位置**：`.github/workflows/deploy.yml`
- **触发条件**：推送到 `main` 分支
- **部署流程**：
  1. 检出代码
  2. 设置 Node.js 环境
  3. 安装依赖
  4. 构建项目
  5. 部署到 GitHub Pages

### 2. 启用 GitHub Pages

在 GitHub 仓库中配置 Pages 设置：

1. 进入仓库页面，点击 **Settings** 选项卡
2. 在左侧菜单中找到 **Pages** 选项
3. 在 **Source** 部分选择：
   - **Source**: `GitHub Actions`
4. 保存设置

### 3. 自定义域名（可选）

如果使用自定义域名：

1. 在仓库根目录创建 `CNAME` 文件：
   ```bash
   echo "your-domain.com" > CNAME
   ```

2. 在 DNS 提供商处添加记录：
   - 类型: `CNAME`
   - 名称: `www`
   - 值: `username.github.io` (替换为你的用户名)

3. 在 GitHub Pages 设置中配置自定义域名

## 📁 项目结构

### 新增文件

- `.github/workflows/deploy.yml` - GitHub Actions 工作流
- `public/404.html` - SPA 路由重定向处理

### 404.html 说明

由于应用使用 React Router（单页应用），直接访问子路由会返回 404。`public/404.html` 文件实现了重定向逻辑：

- 检测到 404 时，自动重定向到 `index.html`
- React Router 接管路由处理
- 确保所有路由都能正确加载

## 🔧 工作流详解

### 触发条件

```yaml
on:
  push:
    branches:
      - main  # 推送到 main 分支时触发
  pull_request:
    branches:
      - main  # PR 到 main 分支时也运行
```

### 权限配置

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

**权限说明**：
- `contents: read` - 读取仓库代码
- `pages: write` - 写入 GitHub Pages
- `id-token: write` - 用于 OIDC 认证

### 构建步骤

```yaml
steps:
  - name: Checkout
    uses: actions/checkout@v4

  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: '18'
      cache: 'npm'

  - name: Install dependencies
    run: npm ci

  - name: Build
    run: npm run build
    env:
      CI: false  # 禁用 CI 模式，避免构建中断

  - name: Setup Pages
    uses: actions/configure-pages@v4

  - name: Upload artifact
    uses: actions/upload-pages-artifact@v3
    with:
      path: './build'  # 上传构建产物

  - name: Deploy to GitHub Pages
    id: deployment
    uses: actions/deploy-pages@v4
```

## 🛠️ 常见问题

### Q1: 构建失败

**可能原因**：
- Node.js 版本不兼容
- 依赖安装失败
- TypeScript 编译错误

**解决方案**：
- 检查 `package.json` 中的 Node.js 版本要求
- 确保所有依赖在 `package.json` 中正确列出
- 运行 `npm run build` 本地测试

### Q2: 页面显示空白

**可能原因**：
- React Router 路径问题
- 资源路径不正确

**解决方案**：
- 确认 `BrowserRouter` 配置正确
- 检查构建输出中的资源路径
- 确保 `404.html` 文件存在

### Q3: 路由访问返回 404

**已解决**：项目包含 `public/404.html` 文件，自动处理 SPA 路由重定向。

### Q4: GitHub Actions 权限错误

**解决方案**：
1. 进入仓库 Settings > Actions
2. 检查 "Workflow permissions" 设置
3. 选择 "Read and write permissions"
4. 勾选 "Allow GitHub Actions to create and approve pull requests"

## 📝 使用说明

### 首次部署

1. 推送代码到 `main` 分支：
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. 进入 GitHub 仓库的 **Actions** 选项卡
3. 查看工作流运行状态
4. 部署成功后，访问 `https://username.github.io/repository-name`

### 后续更新

- 只需推送代码到 `main` 分支
- GitHub Actions 自动触发构建和部署
- 部署通常需要 2-5 分钟

### 手动部署

如需手动触发部署：

1. 进入 GitHub 仓库的 **Actions** 选项卡
2. 选择 "Deploy to GitHub Pages" 工作流
3. 点击 "Run workflow" 按钮
4. 选择分支并运行

## 🎯 性能优化

### 构建优化

```bash
# 构建时启用优化
npm run build

# 分析包大小
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer build/static/js/*.js
```

### 缓存策略

GitHub Actions 已配置 npm 缓存：
```yaml
with:
  cache: 'npm'
```

这可以加速依赖安装过程。

## 🔍 监控与调试

### 查看构建日志

1. 进入 **Actions** 选项卡
2. 点击具体的工作流运行
3. 查看每个步骤的日志输出

### 本地测试

```bash
# 安装依赖
npm install

# 本地构建
npm run build

# 使用 serve 模拟 GitHub Pages
npm install -g serve
serve -s build
```

### 调试技巧

- 使用 `console.log` 调试 React 组件
- 检查浏览器开发者工具的网络面板
- 查看 GitHub Pages 的 404 错误日志

## 📊 部署状态

### 状态徽章

在 README.md 中添加部署状态徽章：

```markdown
![Deploy to GitHub Pages](https://github.com/username/repository-name/actions/workflows/deploy.yml/badge.svg)
```

### 访问统计

GitHub Pages 提供基本的访问统计：
- 进入仓库 Settings > Pages
- 查看 "Insights" 部分

## 🎓 高级配置

### 多环境部署

如需部署到多个环境，可以创建不同的工作流文件：

- `.github/workflows/deploy-prod.yml` - 生产环境
- `.github/workflows/deploy-staging.yml` - 测试环境

### 分支保护

为保护 `main` 分支：

1. 进入仓库 Settings > Branches
2. 添加分支保护规则
3. 要求通过 PR 合并
4. 要求通过状态检查

### 自定义域名

如果使用自定义域名，确保：

1. DNS 记录配置正确
2. `CNAME` 文件在构建产物中
3. GitHub Pages 设置中启用自定义域名

## 📞 支持

如果遇到问题：

1. 检查 GitHub Actions 日志
2. 查看 [GitHub Pages 文档](https://docs.github.com/en/pages)
3. 查看 [React Router 文档](https://reactrouter.com/)

## 📋 检查清单

部署前检查：

- [ ] GitHub 仓库已创建
- [ ] `.github/workflows/deploy.yml` 文件存在
- [ ] `public/404.html` 文件存在
- [ ] `package.json` 包含正确的构建脚本
- [ ] GitHub Actions 权限已配置
- [ ] Pages 设置中选择了 "GitHub Actions"

部署后验证：

- [ ] 网站可以正常访问
- [ ] 所有路由都能正确加载
- [ ] 静态资源加载正常
- [ ] GitHub Actions 显示成功

## 🎉 完成

恭喜！你的应用现在可以通过 GitHub Pages 访问了：

**访问地址**：`https://username.github.io/repository-name`

享受自动化部署的便利！ 🚀
