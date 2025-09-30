# 发布脚本使用说明

## 自动发布新版本

使用 `release.sh` 脚本可以自动完成版本号更新、提交和标签创建的全部流程。

### 使用方法

```bash
# 方法1: 直接运行脚本
./scripts/release.sh

# 方法2: 使用 npm script (推荐)
npm run release
```

### 功能特性

- ✅ 自动检查未提交的改动
- ✅ 显示当前版本号
- ✅ 支持多种版本升级类型:
  - **patch**: 补丁版本 (0.1.1 → 0.1.2)
  - **minor**: 次要版本 (0.1.1 → 0.2.0)
  - **major**: 主要版本 (0.1.1 → 1.0.0)
  - **custom**: 自定义版本号
- ✅ 自动更新所有配置文件:
  - `package.json`
  - `src-tauri/tauri.conf.json`
  - `src-tauri/Cargo.toml`
  - `src-tauri/Cargo.lock`
- ✅ 自动创建提交和标签
- ✅ 自动推送到远程仓库
- ✅ 触发 GitHub Actions 构建

### 使用示例

```bash
$ npm run release

[INFO] 当前版本: v0.1.1

请选择版本更新类型:
  1) patch (补丁版本, 如 0.1.1 -> 0.1.2)
  2) minor (次要版本, 如 0.1.1 -> 0.2.0)
  3) major (主要版本, 如 0.1.1 -> 1.0.0)
  4) custom (自定义版本号)

请选择 [1-4]: 1
[INFO] 新版本: v0.1.2

确认要发布 v0.1.2 版本吗? [y/N]: y

[INFO] 开始更新版本号...
[INFO] 更新 package.json
[INFO] 更新 src-tauri/tauri.conf.json
[INFO] 更新 src-tauri/Cargo.toml
[INFO] 更新 src-tauri/Cargo.lock
[INFO] 提交版本更新...
[INFO] 创建并推送 tag v0.1.2...
[INFO] 推送到远程仓库...

[INFO] ✅ 发布成功! Release v0.1.2 已推送
[INFO] GitHub Actions 正在构建中,请访问:
[INFO] https://github.com/telagod/kooix-host/actions
```

### 注意事项

1. **确保工作区干净**: 脚本会检查是否有未提交的改动
2. **确保在正确的分支**: 通常应该在 `main` 分支执行
3. **需要推送权限**: 确保有权限推送到远程仓库
4. **版本号格式**: 必须遵循语义化版本规范 (x.y.z)

### 版本号规范

遵循 [语义化版本 2.0.0](https://semver.org/lang/zh-CN/):

- **主版本号 (Major)**: 不兼容的 API 修改
- **次版本号 (Minor)**: 向下兼容的功能性新增
- **修订号 (Patch)**: 向下兼容的问题修正

### 故障排查

**问题: "有未提交的改动"**
```bash
# 提交或暂存改动
git add .
git commit -m "your message"

# 或者暂存改动
git stash
```

**问题: "版本号格式错误"**
- 确保版本号格式为 `x.y.z` (如 `0.1.2`, `1.0.0`)
- 不要包含 `v` 前缀

**问题: "推送失败"**
- 检查网络连接
- 确保有仓库推送权限
- 检查远程仓库地址是否正确

### 手动发布 (不推荐)

如果需要手动发布,可以按以下步骤:

```bash
# 1. 更新版本号 (手动修改配置文件)
# 2. 提交改动
git add .
git commit -m "chore: bump version to x.y.z"

# 3. 创建标签
git tag -a vx.y.z -m "Release vx.y.z"

# 4. 推送
git push origin main
git push origin vx.y.z
```

但是 **强烈推荐使用自动化脚本** 以避免遗漏步骤或出错 🎯