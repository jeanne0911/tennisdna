#!/bin/bash
# 网球DNA测试 - 自动化部署到服务器 150.158.141.205:8080
# 使用方法：./deploy_to_server.sh

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 服务器配置
SERVER_IP="150.158.141.205"
SERVER_PORT="8080"
SERVER_USER="root"  # 如果不是root，请修改为实际用户名
PROJECT_DIR="/opt/tennisdna"

# 数据库配置
DB_HOST="sh-cynosdbmysql-grp-5awkhsnm.sql.tencentcdb.com"
DB_PORT="21797"
DB_NAME="pdf-generator-prod-8dk636da61e07"
DB_USER="admin"
DB_PASS="Kx7#mPqR2@nL9vZw"

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  网球DNA测试 - 自动部署脚本${NC}"
echo -e "${BLUE}=========================================${NC}"
echo -e "${GREEN}服务器:${NC} ${SERVER_IP}:${SERVER_PORT}"
echo -e "${GREEN}项目目录:${NC} ${PROJECT_DIR}"
echo ""

# 检查本地是否有.env文件
if [ ! -f .env ]; then
    echo -e "${YELLOW}警告: .env 文件不存在${NC}"
    echo "请先创建 .env 文件并配置数据库连接信息"
    exit 1
fi

echo -e "${BLUE}[1/8] 连接到服务器...${NC}"
# 测试SSH连接
if ! ssh -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_IP} "echo 'Connection successful'" > /dev/null 2>&1; then
    echo -e "${RED}❌ 无法连接到服务器 ${SERVER_IP}${NC}"
    echo "请检查："
    echo "  1. 服务器IP是否正确"
    echo "  2. SSH密钥是否配置"
    echo "  3. 防火墙是否允许SSH连接"
    exit 1
fi
echo -e "${GREEN}✅ 服务器连接成功${NC}"
echo ""

echo -e "${BLUE}[2/8] 在服务器上安装必要软件...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
# 更新系统包列表
apt update -qq

# 检查并安装Python3和pip
if ! command -v python3 &> /dev/null; then
    echo "安装Python3..."
    apt install -y python3 python3-pip python3-venv
else
    echo "Python3已安装: $(python3 --version)"
fi

# 检查并安装Git
if ! command -v git &> /dev/null; then
    echo "安装Git..."
    apt install -y git
else
    echo "Git已安装: $(git --version)"
fi

# 检查并安装PM2（进程管理）
if ! command -v pm2 &> /dev/null; then
    echo "安装Node.js和PM2..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    npm install -g pm2
else
    echo "PM2已安装"
fi

echo "✅ 所有依赖已安装"
ENDSSH
echo ""

echo -e "${BLUE}[3/8] 克隆/更新项目代码...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} << ENDSSH
if [ -d "${PROJECT_DIR}" ]; then
    echo "更新现有项目..."
    cd ${PROJECT_DIR}
    git fetch origin
    git reset --hard origin/main
else
    echo "克隆新项目..."
    mkdir -p ${PROJECT_DIR}
    cd ${PROJECT_DIR}
    git clone https://github.com/jeanne0911/tennisdna.git .
fi
echo "✅ 项目代码已准备"
ENDSSH
echo ""

echo -e "${BLUE}[4/8] 上传环境变量文件...${NC}"
scp .env ${SERVER_USER}@${SERVER_IP}:${PROJECT_DIR}/.env
echo -e "${GREEN}✅ 环境变量文件已上传${NC}"
echo ""

echo -e "${BLUE}[5/8] 安装Python依赖...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} << ENDSSH
cd ${PROJECT_DIR}

# 创建虚拟环境（如果不存在）
if [ ! -d "venv" ]; then
    echo "创建Python虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境并安装依赖
echo "安装Python依赖包..."
source venv/bin/activate
pip install -q --upgrade pip
pip install -r requirements.txt
echo "✅ Python依赖已安装"
ENDSSH
echo ""

echo -e "${BLUE}[6/8] 测试数据库连接...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} << ENDSSH
cd ${PROJECT_DIR}
source venv/bin/activate

python3 << 'EOFPY'
import pymysql
from dotenv import load_dotenv
import os

load_dotenv()

try:
    conn = pymysql.connect(
        host=os.getenv('MYSQL_HOST'),
        port=int(os.getenv('MYSQL_PORT')),
        user=os.getenv('MYSQL_USER'),
        password=os.getenv('MYSQL_PASSWORD'),
        database=os.getenv('MYSQL_DATABASE')
    )
    print("✅ 数据库连接成功！")
    conn.close()
except Exception as e:
    print(f"❌ 数据库连接失败: {e}")
    exit(1)
EOFPY

if [ $? -ne 0 ]; then
    echo "数据库连接失败，请检查配置"
    exit 1
fi
ENDSSH
echo ""

echo -e "${BLUE}[7/8] 使用PM2启动应用...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} << ENDSSH
cd ${PROJECT_DIR}

# 停止旧进程（如果存在）
pm2 stop tennis-dna 2>/dev/null || true
pm2 delete tennis-dna 2>/dev/null || true

# 使用PM2启动应用
pm2 start venv/bin/uvicorn --name tennis-dna -- \
    --chdir ${PROJECT_DIR} \
    main:app \
    --host 0.0.0.0 \
    --port ${SERVER_PORT}

# 保存PM2配置
pm2 save

# 设置开机自启
pm2 startup systemd -u ${SERVER_USER} --hp /home/${SERVER_USER} 2>/dev/null || true

echo "✅ 应用已启动"
ENDSSH
echo ""

echo -e "${BLUE}[8/8] 验证部署...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} << ENDSSH
echo ""
echo "========================================="
echo "  PM2 状态"
echo "========================================="
pm2 status tennis-dna
echo ""
echo "========================================="
echo "  应用日志（最近10行）"
echo "========================================="
pm2 logs tennis-dna --lines 10 --nostream
echo ""
echo "========================================="
echo "  测试API"
echo "========================================="
sleep 2
curl -s http://localhost:${SERVER_PORT}/api/test_count | python3 -m json.tool 2>/dev/null || echo "API测试中..."
ENDSSH
echo ""

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  🎉 部署完成！${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${BLUE}访问地址:${NC}"
echo -e "  应用首页: ${YELLOW}http://${SERVER_IP}:${SERVER_PORT}${NC}"
echo -e "  API文档: ${YELLOW}http://${SERVER_IP}:${SERVER_PORT}/docs${NC}"
echo ""
echo -e "${BLUE}常用命令:${NC}"
echo -e "  查看状态: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 status'"
echo -e "  查看日志: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 logs tennis-dna'"
echo -e "  重启应用: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 restart tennis-dna'"
echo ""
echo -e "${YELLOW}⚠️  重要提醒:${NC}"
echo -e "  1. 确保服务器防火墙开放 ${SERVER_PORT} 端口"
echo -e "  2. 确保腾讯云安全组允许 ${SERVER_PORT} 端口入站"
echo ""
