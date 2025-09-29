# Kooix Host Manager

<div align="center">

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)

**轻量化全平台 Hosts 多源聚合订阅更新工具**

简洁美观 · 跨平台 · 自动更新 · 开源免费

[功能特性](#-功能特性) · [快速开始](#-快速开始) · [使用说明](#-使用说明) · [开发](#-开发)

</div>

---

## 📖 简介

Kooix Host Manager 是一款现代化的 Hosts 文件管理工具，支持多订阅源聚合、自动更新、深色主题等功能。采用 Tauri 2.0 + React 19 技术栈，提供原生应用般的流畅体验。

### 为什么选择 Kooix？

- 🚀 **轻量高效** - 基于 Tauri 构建，安装包体积小，内存占用低
- 🎨 **现代美观** - 扁平化设计，支持深色/浅色主题切换
- 🔄 **自动更新** - 可配置定时自动同步订阅源
- 📝 **直接编辑** - 内置 VSCode 风格编辑器，支持语法高亮
- 🌐 **跨平台** - 完美支持 Windows、macOS 和 Linux
- 🔒 **安全可靠** - 自动提权，安全备份，开源透明

## ✨ 功能特性

### 核心功能

- **多源聚合**
  - 支持添加多个 Hosts 订阅源
  - 一键聚合更新所有启用的订阅源
  - 订阅源启用/禁用管理
  - 订阅源测试连接功能

- **自动更新**
  - 可配置自动更新间隔（1-168 小时）
  - 后台定时同步订阅源
  - 上次更新时间记录

- **Hosts 编辑器**
  - VSCode 风格代码编辑器
  - 语法高亮显示
  - 深色/浅色主题适配
  - 实时行数统计
  - 修改提示与恢复功能

- **主题切换**
  - 深色模式/浅色模式
  - 全局主题持久化
  - 编辑器主题联动

- **系统集成**
  - 自动提权（Linux/macOS 使用 pkexec/sudo）
  - Hosts 文件备份
  - 跨平台路径适配

### 技术亮点

- **前端技术栈**
  - React 19 - 最新版本，性能优化
  - TypeScript - 类型安全
  - Tailwind CSS 3 - 现代化样式
  - Vite 7 - 极速构建
  - CodeMirror - 专业代码编辑器

- **后端技术栈**
  - Tauri 2.0 - 轻量级跨平台框架
  - Rust - 高性能系统编程
  - Tokio - 异步运行时
  - Reqwest - HTTP 客户端

## 🚀 快速开始

### 下载安装

#### 从 Release 下载（推荐）

前往 [Releases](https://github.com/telagod/kooix-host/releases) 页面下载对应平台的安装包：

- **Windows**: `kooix-host-manager_x.x.x_x64_en-US.msi`
- **macOS**: `kooix-host-manager_x.x.x_x64.dmg`
- **Linux**: `kooix-host-manager_x.x.x_amd64.deb` 或 `kooix-host-manager_x.x.x_amd64.AppImage`

#### 从源码构建

```bash
# 克隆仓库
git clone https://github.com/telagod/kooix-host.git
cd kooix-host/frontend

# 安装依赖
npm install

# 开发模式运行
npm run tauri:dev

# 构建生产版本
npm run tauri:build
```

### 系统要求

- **Windows**: Windows 10 或更高版本
- **macOS**: macOS 10.15 或更高版本
- **Linux**:
  - Ubuntu 20.04 或更高版本
  - 其他主流发行版（需要 GTK 3.0+）

## 📚 使用说明

### 1. 添加订阅源

1. 进入「订阅源」页面
2. 点击「添加订阅源」按钮
3. 输入订阅源名称和 URL
4. 点击「测试连接」验证可用性
5. 点击「保存更改」

**推荐订阅源：**

- GitHub520: `https://raw.githubusercontent.com/521xueweihan/GitHub520/main/hosts`
- SwitchHosts: `https://cdn.jsdelivr.net/gh/oldj/SwitchHosts@master/src/renderer/components/hosts.txt`

### 2. 更新 Hosts

1. 在「仪表盘」页面点击「更新 Hosts」按钮
2. 等待订阅源下载和聚合
3. 自动写入系统 Hosts 文件（需要管理员权限）

### 3. 配置自动更新

1. 进入「设置」页面
2. 启用「自动更新」开关
3. 设置更新间隔（建议 12-24 小时）

### 4. 编辑 Hosts

1. 进入「编辑器」页面
2. 直接编辑 Hosts 文件内容
3. 使用快捷键：
   - `Ctrl/Cmd + F`: 搜索
   - `Ctrl/Cmd + S`: 保存（暂未实现）
4. 点击「恢复」撤销修改

### 5. 备份 Hosts

1. 在「仪表盘」页面点击「备份 Hosts」
2. 自动创建带时间戳的备份文件

## 🛠 开发

### 开发环境准备

**前置要求：**

- Node.js 18+ 和 npm
- Rust 1.70+
- 系统相关依赖：
  - **Linux**: `build-essential`, `libgtk-3-dev`, `libwebkit2gtk-4.0-dev`, `libssl-dev`
  - **macOS**: Xcode Command Line Tools
  - **Windows**: Microsoft Visual Studio C++ Build Tools

### 本地开发

```bash
# 进入项目目录
cd kooix-host/frontend

# 安装依赖
npm install

# 启动开发服务器
npm run tauri:dev

# 代码检查
npm run lint

# 构建应用
npm run tauri:build
```

### 项目结构

```
frontend/
├── src/
│   ├── api/              # API 调用封装
│   ├── components/       # React 组件
│   │   └── ui/          # UI 基础组件
│   ├── contexts/        # React Context
│   │   ├── ThemeContext.tsx       # 主题管理
│   │   └── AutoUpdateContext.tsx  # 自动更新管理
│   ├── pages/           # 页面组件
│   │   ├── Dashboard.tsx    # 仪表盘
│   │   ├── Sources.tsx      # 订阅源管理
│   │   ├── Editor.tsx       # Hosts 编辑器
│   │   └── Settings.tsx     # 设置
│   ├── types/           # TypeScript 类型定义
│   ├── App.tsx          # 主应用组件
│   └── main.tsx         # 应用入口
├── src-tauri/
│   ├── src/
│   │   ├── commands.rs  # Tauri 命令
│   │   ├── config.rs    # 配置管理
│   │   ├── fetcher.rs   # 订阅源获取
│   │   ├── hosts.rs     # Hosts 文件操作
│   │   └── main.rs      # Rust 入口
│   └── Cargo.toml       # Rust 依赖配置
└── package.json         # Node.js 配置
```

### 技术架构

```
┌─────────────────────────────────────┐
│         React Frontend              │
│  (TypeScript + Tailwind CSS)        │
└──────────────┬──────────────────────┘
               │ Tauri IPC
┌──────────────┴──────────────────────┐
│         Rust Backend                │
│  (Tokio + Reqwest + Anyhow)         │
└──────────────┬──────────────────────┘
               │ System APIs
┌──────────────┴──────────────────────┐
│      Operating System               │
│  (Windows / macOS / Linux)          │
└─────────────────────────────────────┘
```

## 🤝 贡献

欢迎贡献代码、报告问题或提出新功能建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Tauri](https://tauri.app/) - 跨平台应用框架
- [React](https://react.dev/) - 前端框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [shadcn/ui](https://ui.shadcn.com/) - UI 组件设计灵感
- [Lucide](https://lucide.dev/) - 图标库
- [CodeMirror](https://codemirror.net/) - 代码编辑器

## 📮 联系方式

- 项目主页: [https://github.com/telagod/kooix-host](https://github.com/telagod/kooix-host)
- 问题反馈: [Issues](https://github.com/telagod/kooix-host/issues)

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐️ Star 支持一下！**

Made with ❤️ by telagod

</div>
