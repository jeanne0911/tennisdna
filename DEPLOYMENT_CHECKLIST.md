# 🚀 网球DNA测试 - 服务器部署检查清单

**服务器**: 150.158.141.205
**端口**: 8080
**GitHub**: https://github.com/jeanne0911/tennisdna

---

## 📋 部署前检查

### 1. 服务器访问
- [ ] 可以SSH连接到 150.158.141.205
- [ ] 有服务器的root权限或sudo权限
- [ ] 服务器可以访问外网（用于下载依赖和访问云数据库）

### 2. 云数据库访问
- [ ] 云数据库已创建：`pdf-generator-prod-8dk636da61e07`
- [ ] 服务器可以访问 `sh-cynosdbmysql-grp-5awkhsnm.sql.tencentcdb.com:21797`
- [ ] 数据库用户admin的权限已配置
- [ ] 数据库表 `test_results` 已创建（如果需要）

### 3. 网络配置
- [ ] 云服务器安全组已开放 8080 端口
  - 协议：TCP
  - 端口：8080
  - 来源：0.0.0.0/0（或指定IP）
- [ ] 服务器防火墙已允许 8080 端口

---

## 🔧 部署方式选择

### 方式一：自动部署脚本（推荐，最简单）

**本地执行：**
```bash
chmod +x deploy_to_server.sh
./deploy_to_server.sh
```

**优点：**
- ✅ 一键部署，无需手动操作
- ✅ 自动安装依赖
- ✅ 自动配置PM2
- ✅ 自动验证部署

**缺点：**
- ⚠️ 需要本地配置SSH密钥
- ⚠️ 本地需要有.env文件

---

### 方式二：在服务器上手动部署

**步骤：**

```bash
# 1. SSH连接到服务器
ssh root@150.158.141.205

# 2. 下载并运行快速部署脚本
cd /tmp
wget https://raw.githubusercontent.com/jeanne0911/tennisdna/main/QUICK_DEPLOY.sh
chmod +x QUICK_DEPLOY.sh
./QUICK_DEPLOY.sh
```

**优点：**
- ✅ 不需要本地配置
- ✅ 直接在服务器操作
- ✅ 可以实时看到部署过程

**缺点：**
- ⚠️ 需要手动复制脚本或从GitHub下载

---

### 方式三：完全手动部署

**详细步骤：**

```bash
# 1. 连接服务器
ssh root@150.158.141.205

# 2. 安装依赖
apt update
apt install -y python3 python3-pip git nodejs npm
npm install -g pm2

# 3. 克隆项目
cd /opt
git clone https://github.com/jeanne0911/tennisdna.git
cd tennisdna

# 4. 创建.env文件
cat > .env << 'EOF'
MYSQL_HOST=sh-cynosdbmysql-grp-5awkhsnm.sql.tencentcdb.com
MYSQL_PORT=21797
MYSQL_DATABASE=pdf-generator-prod-8dk636da61e07
MYSQL_USER=admin
MYSQL_PASSWORD=Kx7#mPqR2@nL9vZw
EOF

# 5. 安装Python依赖
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 6. 启动应用
pm2 start venv/bin/uvicorn --name tennis-dna -- \
    --chdir /opt/tennisdna \
    main:app \
    --host 0.0.0.0 \
    --port 8080

# 7. 保存PM2配置
pm2 save
pm2 startup
```

**优点：**
- ✅ 完全控制每个步骤
- ✅ 可以根据需要调整
- ✅ 便于排查问题

**缺点：**
- ⚠️ 步骤多，容易遗漏
- ⚠️ 耗时较长

---

## ✅ 部署后验证

### 1. 应用状态检查
```bash
# SSH连接到服务器
ssh root@150.158.141.205

# 查看PM2状态
pm2 status tennis-dna

# 应该看到：online tennis-dna
```

- [ ] PM2状态显示 `online`
- [ ] 进程运行正常，没有频繁重启

### 2. 日志检查
```bash
# 查看应用日志
pm2 logs tennis-dna

# 应该看到：
# - 应用启动成功
# - Uvicorn running on http://0.0.0.0:8080
# - 没有错误信息
```

- [ ] 日志中没有ERROR级别错误
- [ ] 应用成功监听 0.0.0.0:8080

### 3. 端口监听检查
```bash
# 检查端口监听
netstat -tlnp | grep 8080

# 应该看到：
# - tcp 0 0 0.0.0.0:8080 0.0.0.0:* LISTEN
```

- [ ] 8080端口正在监听

### 4. API功能测试
```bash
# 测试API（在服务器上）
curl http://localhost:8080/api/test_count

# 应该返回JSON数据，例如：
# {"code": 0, "count": 99}
```

- [ ] API返回正确的JSON数据

### 5. 外网访问测试

在你的本地浏览器或终端测试：

```bash
# 测试主页
curl http://150.158.141.205:8080/

# 测试API
curl http://150.158.141.205:8080/api/test_count

# 测试API文档
# 在浏览器访问：http://150.158.141.205:8080/docs
```

- [ ] 可以访问 http://150.158.141.205:8080
- [ ] API文档页面正常显示
- [ ] API调用成功返回数据

---

## 🌐 最终访问地址

部署成功后，可以通过以下地址访问：

| 服务 | 地址 |
|------|------|
| **应用首页** | http://150.158.141.205:8080 |
| **API文档** | http://150.158.141.205:8080/docs |
| **测试人数API** | http://150.158.141.205:8080/api/test_count |
| **提交结果API** | http://150.158.141.205:8080/api/submit_result |

---

## 🛠️ 常用管理命令

### 查看应用状态
```bash
ssh root@150.158.141.205 'pm2 status tennis-dna'
```

### 查看应用日志
```bash
ssh root@150.158.141.205 'pm2 logs tennis-dna'
```

### 重启应用
```bash
ssh root@150.158.141.205 'pm2 restart tennis-dna'
```

### 停止应用
```bash
ssh root@150.158.141.205 'pm2 stop tennis-dna'
```

### 更新代码
```bash
ssh root@150.158.141.205 << 'EOF'
cd /opt/tennisdna
git pull origin main
pm2 restart tennis-dna
EOF
```

---

## ❗ 故障排查

### 问题1：无法访问应用

**检查项：**
- [ ] PM2进程是否运行：`pm2 status`
- [ ] 端口是否监听：`netstat -tlnp | grep 8080`
- [ ] 防火墙是否开放：`ufw status` 或 `iptables -L`
- [ ] 云安全组是否配置

**解决方法：**
```bash
# 重启应用
pm2 restart tennis-dna

# 检查详细日志
pm2 logs tennis-dna --lines 50

# 查看系统日志
journalctl -xe
```

### 问题2：数据库连接失败

**检查项：**
- [ ] .env文件配置是否正确
- [ ] 云数据库是否可访问
- [ ] 数据库用户权限是否正确

**解决方法：**
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
    print("✅ 数据库连接成功")
    conn.close()
except Exception as e:
    print(f"❌ 数据库连接失败: {e}")
EOF
```

### 问题3：应用频繁重启

**检查项：**
- [ ] 内存是否足够：`free -h`
- [ ] 日志是否有错误
- [ ] 依赖是否完整安装

**解决方法：**
```bash
# 重新安装依赖
cd /opt/tennisdna
source venv/bin/activate
pip install -r requirements.txt

# 重启应用
pm2 restart tennis-dna
```

---

## 📞 获取帮助

如果遇到问题：

1. **查看文档**：`SERVER_DEPLOYMENT_GUIDE.md`
2. **查看日志**：`pm2 logs tennis-dna`
3. **检查网络**：`ping 150.158.141.205`
4. **测试端口**：`telnet 150.158.141.205 8080`

---

**准备就绪后，选择一种部署方式开始部署！** 🚀
