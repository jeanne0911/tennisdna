# 网球DNA测试 - 服务器部署指南

## 🖥️ 服务器信息
- **服务器IP**: 150.158.141.205
- **部署端口**: 8080
- **GitHub仓库**: https://github.com/jeanne0911/tennisdna

## 📋 部署前准备清单

### 1. 本地准备
- ✅ 代码已推送到GitHub
- ✅ `.env` 文件已创建（包含云数据库配置）
- ✅ 部署脚本已准备（`deploy.sh`）

### 2. 服务器需要安装的软件
- Python 3.8+
- Git
- pip（Python包管理器）

### 3. 云数据库配置
- 主机: sh-cynosdbmysql-grp-5awkhsnm.sql.tencentcdb.com
- 端口: 21797
- 数据库: pdf-generator-prod-8dk636da61e07
- 用户: admin

## 🚀 完整部署步骤

### 第一步：连接到服务器

```bash
# SSH连接到服务器
ssh root@150.158.141.205

# 或者使用你的用户名
ssh your_username@150.158.141.205
```

### 第二步：安装必要的软件

```bash
# 更新系统
apt update && apt upgrade -y

# 安装Python3和pip
apt install -y python3 python3-pip python3-venv

# 安装Git
apt install -y git

# 验证安装
python3 --version
git --version
```

### 第三步：克隆项目代码

```bash
# 进入目标目录（例如 /opt 或 /var/www）
cd /opt

# 克隆项目
git clone https://github.com/jeanne0911/tennisdna.git

# 进入项目目录
cd tennisdna
```

### 第四步：创建环境变量文件

```bash
# 创建.env文件
cat > .env << 'EOF'
# 云数据库配置
MYSQL_HOST=sh-cynosdbmysql-grp-5awkhsnm.sql.tencentcdb.com
MYSQL_PORT=21797
MYSQL_DATABASE=pdf-generator-prod-8dk636da61e07
MYSQL_USER=admin
MYSQL_PASSWORD=Kx7#mPqR2@nL9vZw
EOF

# 验证文件创建成功
cat .env
```

### 第五步：安装Python依赖

```bash
# 安装项目依赖
pip3 install -r requirements.txt

# 或者使用虚拟环境（推荐）
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 第六步：测试数据库连接

```bash
# 测试数据库连接
python3 << 'EOF'
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
EOF
```

### 第七步：创建数据库表（如果还没有）

```bash
# 使用MySQL客户端创建表（需要安装mysql-client）
apt install -y mysql-client

# 连接到云数据库并执行初始化脚本
mysql -h sh-cynosdbmysql-grp-5awkhsnm.sql.tencentcdb.com -P 21797 -u admin -p'Kx7#mPqR2@nL9vZw' pdf-generator-prod-8dk636da61e07 < init_database.sql

# 或者手动执行SQL
mysql -h sh-cynosdbmysql-grp-5awkhsnm.sql.tencentcdb.com -P 21797 -u admin -p'Kx7#mPqR2@nL9vZw' pdf-generator-prod-8dk636da61e07
```

### 第八步：启动应用

```bash
# 方式一：直接启动（测试用）
uvicorn main:app --host 0.0.0.0 --port 8080

# 方式二：后台启动
nohup uvicorn main:app --host 0.0.0.0 --port 8080 > app.log 2>&1 &

# 方式三：使用部署脚本（推荐）
chmod +x deploy.sh
# 修改deploy.sh中的端口为8080
sed -i 's/--port 8000/--port 8080/g' deploy.sh
./deploy.sh
```

### 第九步：验证部署

```bash
# 查看应用日志
tail -f app.log

# 检查端口是否监听
netstat -tlnp | grep 8080
# 或
ss -tlnp | grep 8080

# 测试API
curl http://localhost:8080/api/test_count

# 或从本地测试
curl http://150.158.141.205:8080/api/test_count
```

### 第十步：配置防火墙

```bash
# 如果使用UFW防火墙
ufw allow 8080/tcp
ufw reload

# 如果使用iptables
iptables -I INPUT -p tcp --dport 8080 -j ACCEPT
service iptables save

# 腾讯云安全组配置：
# 1. 登录腾讯云控制台
# 2. 进入云服务器安全组设置
# 3. 添加入站规则：端口8080，来源0.0.0.0/0
```

## 🔧 进阶配置（推荐）

### 使用PM2管理进程（推荐）

```bash
# 安装PM2（需要Node.js）
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
npm install -g pm2

# 使用PM2启动应用
pm2 start uvicorn --name tennis-dna -- main:app --host 0.0.0.0 --port 8080

# 保存PM2配置
pm2 save

# 设置开机自启
pm2 startup
```

### 配置Nginx反向代理（可选）

```bash
# 安装Nginx
apt install -y nginx

# 创建Nginx配置
cat > /etc/nginx/sites-available/tennisdna << 'EOF'
server {
    listen 80;
    server_name 150.158.141.205;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# 启用配置
ln -s /etc/nginx/sites-available/tennisdna /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 配置SSL证书（HTTPS，可选）

```bash
# 安装Certbot
apt install -y certbot python3-certbot-nginx

# 获取SSL证书
certbot --nginx -d 150.158.141.205

# 自动续期
certbot renew --dry-run
```

## 📊 监控和维护

### 查看应用状态
```bash
# 如果使用PM2
pm2 status
pm2 logs tennis-dna

# 如果使用nohup
ps aux | grep uvicorn
tail -f app.log
```

### 重启应用
```bash
# PM2方式
pm2 restart tennis-dna

# 手动方式
pkill -f "uvicorn main:app"
nohup uvicorn main:app --host 0.0.0.0 --port 8080 > app.log 2>&1 &
```

### 更新代码
```bash
cd /opt/tennisdna
git pull origin main
pm2 restart tennis-dna
# 或
nohup uvicorn main:app --host 0.0.0.0 --port 8080 > app.log 2>&1 &
```

## 🌐 访问地址

部署成功后，可以通过以下地址访问：

- **应用首页**: http://150.158.141.205:8080
- **API文档**: http://150.158.141.205:8080/docs
- **API测试**: http://150.158.141.205:8080/api/test_count

## ❗ 常见问题

### 1. 数据库连接失败
- 检查云数据库安全组设置
- 确认服务器可以访问外网
- 验证数据库用户权限

### 2. 端口被占用
```bash
# 查看端口占用
lsof -i :8080
# 或
netstat -tlnp | grep 8080

# 杀死占用进程
kill -9 <PID>
```

### 3. 权限问题
```bash
# 给脚本执行权限
chmod +x deploy.sh

# 修改文件所有者
chown -R $USER:$USER /opt/tennisdna
```

## 📞 支持

如有问题，请检查：
1. 应用日志：`tail -f app.log`
2. 系统日志：`journalctl -u nginx`（如果使用Nginx）
3. PM2日志：`pm2 logs tennis-dna`

---

**部署日期**: $(date)
**服务器**: 150.158.141.205:8080
**状态**: 待部署
