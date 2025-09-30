#!/bin/bash
# Kooix Host Manager Release Script
# 自动更新版本号并创建发布标签

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印彩色信息
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# 检查是否有未提交的改动
if [[ -n $(git status -s) ]]; then
    error "有未提交的改动,请先提交或暂存"
fi

# 获取当前版本
CURRENT_VERSION=$(node -p "require('./package.json').version")
info "当前版本: v${CURRENT_VERSION}"

# 询问新版本号
echo ""
echo -e "${YELLOW}请选择版本更新类型:${NC}"
echo "  1) patch (补丁版本, 如 0.1.1 -> 0.1.2)"
echo "  2) minor (次要版本, 如 0.1.1 -> 0.2.0)"
echo "  3) major (主要版本, 如 0.1.1 -> 1.0.0)"
echo "  4) custom (自定义版本号)"
echo ""
read -p "请选择 [1-4]: " choice

case $choice in
    1)
        # patch: 0.1.1 -> 0.1.2
        NEW_VERSION=$(node -p "const v=require('./package.json').version.split('.'); v[2]=parseInt(v[2])+1; v.join('.')")
        ;;
    2)
        # minor: 0.1.1 -> 0.2.0
        NEW_VERSION=$(node -p "const v=require('./package.json').version.split('.'); v[1]=parseInt(v[1])+1; v[2]=0; v.join('.')")
        ;;
    3)
        # major: 0.1.1 -> 1.0.0
        NEW_VERSION=$(node -p "const v=require('./package.json').version.split('.'); v[0]=parseInt(v[0])+1; v[1]=0; v[2]=0; v.join('.')")
        ;;
    4)
        read -p "请输入新版本号 (如 0.2.0): " NEW_VERSION
        # 验证版本号格式
        if ! [[ $NEW_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            error "版本号格式错误,请使用 x.y.z 格式"
        fi
        ;;
    *)
        error "无效的选择"
        ;;
esac

info "新版本: v${NEW_VERSION}"

# 确认
echo ""
read -p "确认要发布 v${NEW_VERSION} 版本吗? [y/N]: " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    warn "已取消发布"
    exit 0
fi

echo ""
info "开始更新版本号..."

# 更新 package.json
info "更新 package.json"
node -e "const fs=require('fs'); const pkg=require('./package.json'); pkg.version='${NEW_VERSION}'; fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');"

# 更新 src-tauri/tauri.conf.json
info "更新 src-tauri/tauri.conf.json"
node -e "const fs=require('fs'); const cfg=JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json', 'utf8')); cfg.version='${NEW_VERSION}'; fs.writeFileSync('src-tauri/tauri.conf.json', JSON.stringify(cfg, null, 2) + '\n');"

# 更新 src-tauri/Cargo.toml
info "更新 src-tauri/Cargo.toml"
sed -i.bak "s/^version = \".*\"/version = \"${NEW_VERSION}\"/" src-tauri/Cargo.toml
rm -f src-tauri/Cargo.toml.bak

# 更新 Cargo.lock
info "更新 src-tauri/Cargo.lock"
cd src-tauri
cargo update -p app --quiet
cd ..

# 提交改动
info "提交版本更新..."
git add package.json src-tauri/tauri.conf.json src-tauri/Cargo.toml src-tauri/Cargo.lock
git commit -m "chore: bump version to ${NEW_VERSION}"

# 创建并推送 tag
info "创建并推送 tag v${NEW_VERSION}..."
git tag -a "v${NEW_VERSION}" -m "Release v${NEW_VERSION}"

# 推送到远程
info "推送到远程仓库..."
git push origin main
git push origin "v${NEW_VERSION}"

echo ""
info "✅ 发布成功! Release v${NEW_VERSION} 已推送"
info "GitHub Actions 正在构建中,请访问:"
info "https://github.com/telagod/kooix-host/actions"
echo ""