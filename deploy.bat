@echo off
REM 网球DNA测试 - Windows快速部署脚本

echo =========================================
echo   网球DNA测试 - 快速部署脚本
echo =========================================

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] Python 未安装，请先安装Python
    pause
    exit /b 1
)

echo [成功] Python 已安装

REM 安装依赖
echo [安装] 安装Python依赖...
pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)

echo [成功] 依赖安装成功

REM 检查.env文件
if not exist .env (
    echo [警告] .env 文件不存在
    echo [信息] 正在创建.env文件...

    (
        echo # 云数据库配置
        echo MYSQL_HOST=sh-cynosdbmysql-grp-5awkhsnm.sql.tencentcdb.com
        echo MYSQL_PORT=21797
        echo MYSQL_DATABASE=pdf-generator-prod-8dk636da61e07
        echo MYSQL_USER=admin
        echo MYSQL_PASSWORD=Kx7#mPqR2@nL9vZw
    ) > .env

    echo [成功] .env 文件已创建
)

echo [成功] .env 配置文件已就绪

REM 启动应用
echo [启动] 启动应用...
start "" python -m uvicorn main:app --host 0.0.0.0 --port 8000

timeout /t 3 >nul

echo =========================================
echo   部署信息
echo =========================================
echo 访问地址: http://localhost:8000
echo =========================================
echo.
echo [提示] 应用已在后台启动
echo [提示] 按 Ctrl+C 停止应用
echo.

pause
