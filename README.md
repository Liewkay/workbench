# Liewkay's Workbench v2.0

个人全功能工作台 PWA，现代效率风设计。

## 功能

- 🎯 今日中枢：待办分组（逾期/今天/明天/稍后）、快速笔记、习惯速览
- 📝 知识笔记：Markdown 编辑、文件夹、标签、置顶收藏、网页剪藏
- 🔥 习惯生活：每日打卡、连续天数、热力图
- 🏁 目标追踪：月度目标与进度
- 📚 阅读追剧：书架管理、阅读计时、追剧进度
- 📊 数据总览：活跃热力图、多维度趋势、周报导出
- ⚙️ 系统设置：明暗主题、云端同步（Supabase）或纯本地（IndexedDB）、Web Push 提醒、JSON/CSV/Markdown 导入导出

## 技术栈

- React 18 + TypeScript + Vite 7
- 纯手绘组件与 SVG 图表，无 UI/图表第三方库
- 双模式数据层：配置 `VITE_SUPABASE_URL` 走 Supabase 云端，否则自动 IndexedDB 本地模式
- PWA：离线缓存、系统推送、明暗双主题

## 部署

- 源码：`D:\WorkBuddy\工作台\liewkay-workbench`（本仓库为构建产物）
- 构建发布：运行根目录 `一键部署.bat`，或在源码目录执行 `npx vite build --base=/workbench/` 后同步 `dist/` 到本仓库
- 线上地址：https://liewkay.github.io/workbench/
- 旧版单文件移动工作台存档于 `legacy` 分支
