# 🚀 开始部署到服务器 150.158.141.205:8080

## 📝 部署前确认

在开始部署之前，请确保你已经：

- [ ] 可以SSH连接到服务器 `150.158.141.205`
- [ ] 腾讯云数据库 `pdf-generator-prod-8dk636da61e07` 已创建并可访问
- [ ] 服务器防火墙和腾讯云安全组已开放 8080 端口

---

## 🎯 选择你的部署方式

### 方式一：一键自动部署（推荐 ⭐）

**适用场景**：你已配置好SSH密钥，可以从本地直接连接到服务器

**操作步骤**：

1. 在本地打开终端（PowerShell或Git Bash）

2. 确保本地有 `.env` 文件（包含数据库配置）

3. 执行自动部署脚本：
```bash
cd /d/Personal/tennisdna
bash deploy_to_server.sh
```

4. 等待部署完成，脚本会自动：
   - ✅ 连接到服务器
   - ✅ 安装所有依赖（Python、Git、PM2等）
   - ✅ 克隆或更新项目代码
   - ✅ 上传环境变量文件
   - ✅ 安装Python依赖包
   - ✅ 测试数据库连接
   - ✅ 使用PM2启动应用
   - ✅ 验证部署成功

5. 访问：http://150.158.141.205:8080

---

### 方式二：在服务器上快速部署

**适用场景**：服务器已准备好，可以直接在服务器上操作

**操作步骤**：

1. SSH连接到服务器：
```bash
ssh root@150.158.141.205
```

2. 下载并运行快速部署脚本：
```bash
cd /tmp
wget https://raw.githubusercontent.com/jeanne0911/tennisdna/main/QUICK_DEPLOY.sh
chmod +x QUICK_DEPLOY.sh
./QUICK_DEPLOY.sh
```

3. 等待部署完成，脚本会自动完成所有配置

4. 验证部署：
```bash
pm2 status tennis-dna
curl http://localhost:8080/api/test_count
```

5. 访问：http://150.158.141.205:8080

---

### 方式三：完全手动部署

**适用场景**：需要完全控制每个步骤，或遇到问题需要排查

**操作步骤**：

1. SSH连接到服务器：
```bash
ssh root@150.158.141.205
```

2. 安装系统依赖：
```bash
apt update
apt install -y python3 python3-pip git nodejs npm
npm install -g pm2
```

3. 克隆项目代码：
```bash
cd /opt
git clone https://github.com/jeanne0911/tennisdna.git
cd tennisdna
```

4. 创建环境变量文件：
```bash
cat > .env << 'EOF'
MYSQL_HOST=sh-cynosdbmysql-grp-5awkhsnm.sql.tencentcdb.com
MYSQL_PORT=21797
MYSQL_DATABASE=pdf-generator-prod-8dk636da61e07
MYSQL_USER=admin
MYSQL_PASSWORD=Kx7#mPqR2@nL9vZw
EOF
```

5. 安装Python依赖：
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

6. 启动应用：
```bash
pm2 start venv/bin/uvicorn --name tennis-dna -- \
    --chdir /opt/tennisdna \
    main:app \
    --host 0.0.0.0 \
    --port 8080
```

7. 保存PM2配置：
```bash
pm2 save
pm2 startup
```

8. 验证部署：
```bash
pm2 status tennis-dna
curl http://localhost:8080/api/test_count
```

9. 访问：http://150.158.141.205:8080

---

## ✅ 部署后验证

部署完成后，请执行以下验证：

### 1. 检查应用状态
```bash
ssh root@150.158.141.205 'pm2 status tennis-dna'
```
应该看到：`online tennis-dna`

### 2. 查看应用日志
```bash
ssh root@150.158.141.205 'pm2 logs tennis-dna'
```
应该没有ERROR错误，应用正常运行

### 3. 测试API
```bash
curl http://150.158.141.205:8080/api/test_count
```
应该返回：`{"code": 0, "count": 99}`

### 4. 访问网页
在浏览器中打开：http://150.158.141.205:8080
应该看到网球DNA测试首页

---

## 🌐 最终访问地址

| 服务 | 地址 |
|------|------|
| **应用首页** | http://150.158.141.205:8080 |
| **API文档** | http://150.158.141.205:8080/docs |
| **测试人数API** | http://150.158.141.205:8080/api/test_count |

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

## ❗ 遇到问题？

### 问题1：无法连接到服务器
- 检查服务器IP是否正确：150.158.141.205
- 确认SSH密钥是否配置
- 测试网络连接：`ping 150.158.141.205`

### 问题2：无法访问应用（连接超时）
- 检查防火墙：`ufw status`
- 检查云安全组是否开放8080端口
- 检查应用是否运行：`pm2 status tennis-dna`

### 问题3：数据库连接失败
- 检查.env文件配置是否正确
- 测试数据库连接：参见 `SERVER_DEPLOYMENT_GUIDE.md`
- 确认云数据库安全组允许服务器IP访问

### 问题4：应用频繁重启
- 查看详细日志：`pm2 logs tennis-dna --lines 50`
- 检查内存使用：`free -h`
- 查看系统日志：`journalctl -xe`

---

## 📚 更多文档

- 📋 [详细部署检查清单](./DEPLOYMENT_CHECKLIST.md)
- 📖 [完整部署指南](./SERVER_DEPLOYMENT_GUIDE.md)
- ✅ [部署配置总结](./DEPLOYMENT_SUMMARY.md)
- 🔧 [项目README](./README.md)

---

## 🎉 准备好了吗？

选择上面的**部署方式一、二或三**，开始部署你的应用吧！

部署成功后，你的网球DNA测试就可以通过 http://150.158.141.205:8080 访问了！

---

**需要帮助？**
如果遇到问题，请查看相关文档或检查应用日志。

**祝你部署顺利！** 🚀
