# Neo 疯狂8点 (Neo Crazy Eights)

一个基于 React + Tailwind CSS 构建的经典“疯狂8点”纸牌游戏。

## 🚀 部署到 Vercel 指南

要将此项目同步到 GitHub 并部署到 Vercel，请按照以下步骤操作：

### 1. 初始化 Git 并推送到 GitHub

在你的本地终端中执行以下命令：

```bash
# 初始化 git 仓库
git init

# 添加所有文件
git add .

# 提交更改
git commit -m "Initial commit: Neo Crazy Eights"

# 在 GitHub 上创建一个新的仓库，然后关联它
git remote add origin https://github.com/你的用户名/neo-crazy-eights.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 2. 部署到 Vercel

1. 登录 [Vercel 官网](https://vercel.com/)。
2. 点击 **"Add New..."** -> **"Project"**。
3. 导入你刚刚创建的 GitHub 仓库 `neo-crazy-eights`。
4. 在 **"Configure Project"** 阶段：
   - **Framework Preset**: 自动识别为 `Vite`。
   - **Root Directory**: `./`。
   - **Build Command**: `npm run build`。
   - **Output Directory**: `dist`。
5. (可选) 如果你使用了 Gemini API，请在 **"Environment Variables"** 中添加 `GEMINI_API_KEY`。
6. 点击 **"Deploy"**。

### 3. 访问你的游戏

部署完成后，Vercel 会为你提供一个类似 `https://neo-crazy-eights.vercel.app` 的访问链接。

## 🛠 技术栈

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Animation**: Motion (Framer Motion)
- **Icons**: Lucide React
- **Effects**: Canvas Confetti

## 🎮 游戏规则

- **目标**: 率先出完手中所有的牌。
- **出牌**: 玩家出的牌必须与弃牌堆顶部的牌在“花色”或“点数”上匹配。
- **万能 8 点**: 数字“8”是万用牌，可以在任何时候打出，并指定一个新的花色。
- **摸牌**: 如果无牌可出，必须从摸牌堆摸一张牌。
