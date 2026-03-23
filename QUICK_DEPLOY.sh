#!/bin/bash
# 简化版部署脚本 - 在服务器上直接运行
# 使用方法：
# 1. 上传此文件到服务器
# 2. 在服务器上执行: chmod +x QUICK_DEPLOY.sh && ./QUICK_DEPLOY.sh

echo "========================================="
echo "  网球DNA测试 - 快速部署脚本"
echo "========================================="

# 配置变量
APP_PORT="8080"
PROJECT_DIR="/opt/tennisdna"
REPO_URL="https://github.com/jeanne0911/tennisdna.git"

echo "部署端口: $APP_PORT"
echo "项目目录: $PROJECT_DIR"
echo ""

# 步骤1: 安装依赖
echo "[1/6] 安装系统依赖..."
apt update -qq
apt install -y python3 python3-pip python3-venv git nodejs npm > /dev/null 2>&1
npm install -g pm2 > /dev/null 2>&1
echo "✅ 系统依赖安装完成"
echo ""

# 步骤2: 克隆或更新代码
echo "[2/6] 获取项目代码..."
if [ -d "$PROJECT_DIR" ]; then
    echo "  更新现有项目..."
    cd $PROJECT_DIR
    git fetch origin > /dev/null 2>&1
    git reset --hard origin/main > /dev/null 2>&1
else
    echo "  克隆新项目..."
    mkdir -p $PROJECT_DIR
    cd $PROJECT_DIR
    git clone $REPO_URL . > /dev/null 2>&1
fi
echo "✅ 项目代码准备完成"
echo ""

# 步骤3: 创建.env文件
echo "[3/6] 配置环境变量..."
cat > $PROJECT_DIR/.env << 'EOF'
MYSQL_HOST=sh-cynosdbmysql-grp-5awkhsnm.sql.tencentcdb.com
MYSQL_PORT=21797
MYSQL_DATABASE=pdf-generator-prod-8dk636da61e07
MYSQL_USER=admin
MYSQL_PASSWORD=Kx7#mPqR2@nL9vZw
EOF
echo "✅ 环境变量配置完成"
echo ""

# 步骤4: 安装Python依赖
echo "[4/6] 安装Python依赖..."
cd $PROJECT_DIR
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -q -r requirements.txt
echo "✅ Python依赖安装完成"
echo ""

# 步骤5: 启动应用
echo "[5/6] 启动应用..."
cd $PROJECT_DIR
pm2 stop tennis-dna 2>/dev/null || true
pm2 delete tennis-dna 2>/dev/null || true

pm2 start venv/bin/uvicorn --name tennis-dna -- \
    --chdir $PROJECT_DIR \
    main:app \
    --host 0.0.0.0 \
    --port $APP_PORT

pm2 save > /dev/null 2>&1
echo "✅ 应用启动完成"
echo ""

# 步骤6: 验证部署
echo "[6/6] 验证部署..."
sleep 3
pm2 status tennis-dna
echo ""
echo "测试API调用..."
curl -s http://localhost:$APP_PORT/api/test_count | python3 -m json.tool 2>/dev/null || echo "API调用中..."
echo ""

echo "========================================="
echo "  🎉 部署完成！"
echo "========================================="
echo ""
echo "访问地址:"
echo "  应用首页: http://$(hostname -I | awk '{print $1'}):$APP_PORT"
echo "  API文档: http://$(hostname -I | awk '{print $1'}):$APP_PORT/docs"
echo ""
echo "管理命令:"
echo "  查看状态: pm2 status"
echo "  查看日志: pm2 logs tennis-dna"
echo "  重启应用: pm2 restart tennis-dna"
echo ""
echo "⚠️  记得配置防火墙和云安全组开放 $APP_PORT 端口！"
echo ""
