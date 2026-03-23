# 🎯 部署操作指南 - 下一步行动

## 📋 当前状态总结

### ✅ 已完成的工作
1. **云数据库配置** - 数据库连接已配置完成
2. **代码推送到GitHub** - 所有代码和文档已推送到 https://github.com/jeanne0911/tennisdna
3. **部署文档准备** - 完整的部署文档和脚本已准备就绪

### 🎯 下一步目标
将应用部署到服务器：**150.158.141.205:8080**

---

## 🚀 立即开始部署（3种方式）

### 方式一：本地自动部署（最简单 ⭐）

**前提条件**：
- ✅ 本地已配置SSH密钥，可以连接到 150.158.141.205
- ✅ 本地有 `.env` 文件

**操作步骤**：

1. **打开终端**（Git Bash 或 PowerShell）

2. **进入项目目录**：
```bash
cd /d/Personal/tennisdna
```

3. **运行自动部署脚本**：
```bash
bash deploy_to_server.sh
```

4. **等待完成** - 脚本会自动完成所有配置，包括：
   - 连接到服务器
   - 安装依赖（Python、Git、PM2等）
   - 克隆/更新代码
   - 上传环境变量
   - 安装Python包
   - 启动应用
   - 验证部署

5. **访问应用**：http://150.158.141.205:8080

---

### 方式二：服务器端部署（推荐）

**前提条件**：
- ✅ 可以SSH连接到服务器
- ✅ 服务器可以访问外网

**操作步骤**：

1. **SSH连接到服务器**：
```bash
ssh root@150.158.141.205
```

2. **下载并运行部署脚本**：
```bash
cd /tmp
wget https://raw.githubusercontent.com/jeanne0911/tennisdna/main/QUICK_DEPLOY.sh
chmod +x QUICK_DEPLOY.sh
./QUICK_DEPLOY.sh
```

3. **等待部署完成**（约3-5分钟）

4. **验证部署**：
```bash
pm2 status tennis-dna
curl http://localhost:8080/api/test_count
```

5. **访问应用**：http://150.158.141.205:8080

---

### 方式三：完全手动部署（需要更多时间）

**参考文档**：`SERVER_DEPLOYMENT_GUIDE.md`

**简要步骤**：

```bash
# 1. SSH连接
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

# 7. 保存配置
pm2 save
pm2 startup
```

---

## 📝 部署前检查清单

在开始部署前，请确认：

- [ ] 可以SSH连接到 150.158.141.205
- [ ] 腾讯云数据库 `pdf-generator-prod-8dk636da61e07` 已创建
- [ ] 服务器可以访问云数据库（测试：ping sh-cynosdbmysql-grp-5awkhsnm.sql.tencentcdb.com）
- [ ] 腾讯云安全组已开放 8080 端口
  - 进入腾讯云控制台
  - 找到安全组设置
  - 添加入站规则：TCP 8080，来源 0.0.0.0/0

---

## ✅ 部署后验证

### 1. 检查应用状态
```bash
ssh root@150.158.141.205 'pm2 status tennis-dna'
```
应该看到：`online tennis-dna`

### 2. 查看应用日志
```bash
ssh root@150.158.141.205 'pm2 logs tennis-dna'
```
应该没有ERROR错误

### 3. 测试API
```bash
curl http://150.158.141.205:8080/api/test_count
```
应该返回：`{"code": 0, "count": 99}`

### 4. 访问网页
在浏览器打开：http://150.158.141.205:8080

---

## 🌐 最终访问地址

部署成功后：

| 服务 | 地址 |
|------|------|
| 应用首页 | http://150.158.141.205:8080 |
| API文档 | http://150.158.141.205:8080/docs |
| 测试人数API | http://150.158.141.205:8080/api/test_count |

---

## 🛠️ 常用管理命令

部署成功后，可以使用这些命令管理应用：

```bash
# 查看状态
ssh root@150.158.141.205 'pm2 status tennis-dna'

# 查看日志
ssh root@150.158.141.205 'pm2 logs tennis-dna'

# 重启应用
ssh root@150.158.141.205 'pm2 restart tennis-dna'

# 停止应用
ssh root@150.158.141.205 'pm2 stop tennis-dna'

# 更新代码
ssh root@150.158.141.205 << 'EOF'
cd /opt/tennisdna
git pull origin main
pm2 restart tennis-dna
EOF
```

---

## ❗ 常见问题

### Q1: SSH连接失败
**A**: 检查：
- 服务器IP是否正确：150.158.141.205
- SSH密钥是否配置
- 网络连接是否正常：`ping 150.158.141.205`

### Q2: 无法访问应用（连接超时）
**A**: 检查：
- 应用是否运行：`pm2 status tennis-dna`
- 端口是否监听：`netstat -tlnp | grep 8080`
- 防火墙是否开放：`ufw status`
- 腾讯云安全组是否配置

### Q3: 数据库连接失败
**A**: 检查：
- .env文件配置是否正确
- 云数据库是否可访问
- 数据库用户权限是否正确

### Q4: 应用频繁重启
**A**: 检查：
- 查看详细日志：`pm2 logs tennis-dna --lines 50`
- 检查内存：`free -h`
- 重新安装依赖

---

## 📚 相关文档

| 文档 | 说明 |
|------|------|
| START_HERE.md | 快速开始指南 |
| DEPLOYMENT_CHECKLIST.md | 详细检查清单 |
| SERVER_DEPLOYMENT_GUIDE.md | 完整部署指南 |
| README.md | 项目主文档 |

---

## 🎉 总结

### 你已经完成：
- ✅ 云数据库配置
- ✅ 代码推送到GitHub
- ✅ 部署文档和脚本准备

### 接下来需要做：
1. 选择一种部署方式（推荐方式二）
2. 执行部署脚本
3. 验证部署成功
4. 访问应用

---

**准备好了吗？选择上面的部署方式，开始部署吧！** 🚀

**预计部署时间**：5-10分钟

**需要帮助？** 查看相关文档或检查应用日志
