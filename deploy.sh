#!/bin/bash
# 网球DNA测试 - 云服务器快速部署脚本

echo "========================================="
echo "  网球DNA测试 - 快速部署脚本"
echo "========================================="

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装，请先安装Python3"
    exit 1
fi

echo "✅ Python3 已安装"

# 安装依赖
echo "📦 安装Python依赖..."
pip3 install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装成功"

# 检查.env文件
if [ ! -f .env ]; then
    echo "⚠️  .env 文件不存在，请创建.env文件并配置数据库连接信息"
    echo "   参考内容："
    echo "   MYSQL_HOST=sh-cynosdbmysql-grp-5awkhsnm.sql.tencentcdb.com"
    echo "   MYSQL_PORT=21797"
    echo "   MYSQL_DATABASE=pdf-generator-prod-8dk636da61e07"
    echo "   MYSQL_USER=admin"
    echo "   MYSQL_PASSWORD=Kx7#mPqR2@nL9vZw"
    echo ""
    read -p "是否现在创建.env文件？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cat > .env << EOF
# 云数据库配置
MYSQL_HOST=sh-cynosdbmysql-grp-5awkhsnm.sql.tencentcdb.com
MYSQL_PORT=21797
MYSQL_DATABASE=pdf-generator-prod-8dk636da61e07
MYSQL_USER=admin
MYSQL_PASSWORD=Kx7#mPqR2@nL9vZw
EOF
        echo "✅ .env 文件已创建"
    else
        echo "❌ 未创建.env文件，请手动创建后重新运行"
        exit 1
    fi
fi

echo "✅ .env 配置文件已就绪"

# 停止旧进程（如果存在）
echo "🛑 停止旧进程..."
pkill -f "uvicorn main:app" 2>/dev/null

# 启动应用
echo "🚀 启动应用..."
nohup uvicorn main:app --host 0.0.0.0 --port 8000 > app.log 2>&1 &
PID=$!

# 等待启动
sleep 3

# 检查进程是否运行
if ps -p $PID > /dev/null; then
    echo "✅ 应用启动成功！"
    echo ""
    echo "========================================="
    echo "  部署信息"
    echo "========================================="
    echo "进程ID: $PID"
    echo "访问地址: http://0.0.0.0:8000"
    echo "日志文件: app.log"
    echo "========================================="
    echo ""
    echo "查看日志命令: tail -f app.log"
    echo "停止服务命令: kill $PID"
else
    echo "❌ 应用启动失败，请查看日志: cat app.log"
    exit 1
fi
