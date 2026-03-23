# 网球DNA测试 - 云数据库部署配置总结

## ✅ 已完成的配置更改

### 1. 数据库连接配置
- ✅ 创建 `.env` 文件，包含云数据库配置信息
- ✅ 更新 `main.py`，添加 `python-dotenv` 支持，从环境变量读取数据库配置
- ✅ 保留默认值作为后备方案（向后兼容）

### 2. 依赖管理
- ✅ 在 `requirements.txt` 中添加 `python-dotenv` 依赖

### 3. 部署支持
- ✅ 更新 `Dockerfile`，支持环境变量配置
- ✅ 创建 `.gitignore`，防止敏感信息泄露
- ✅ 创建 `README.md`，提供详细的部署文档
- ✅ 创建 `init_database.sql`，数据库初始化脚本
- ✅ 创建 `deploy.sh`，Linux云服务器快速部署脚本
- ✅ 创建 `deploy.bat`，Windows本地部署脚本

## 📋 云数据库配置信息

```env
MYSQL_HOST=sh-cynosdbmysql-grp-5awkhsnm.sql.tencentcdb.com
MYSQL_PORT=21797
MYSQL_DATABASE=pdf-generator-prod-8dk636da61e07
MYSQL_USER=admin
MYSQL_PASSWORD=Kx7#mPqR2@nL9vZw
```

## 🚀 快速部署方法

### 方法一：使用部署脚本（推荐）

**Linux云服务器：**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Windows本地测试：**
```cmd
deploy.bat
```

### 方法二：手动部署

```bash
# 1. 安装依赖
pip install -r requirements.txt

# 2. 确保.env文件存在（云服务器上可能需要手动创建）

# 3. 启动服务
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 方法三：Docker部署

```bash
# 构建镜像
docker build -t tennis-dna-test .

# 运行容器
docker run -d -p 8000:8000 \
  -e MYSQL_HOST=sh-cynosdbmysql-grp-5awkhsnm.sql.tencentcdb.com \
  -e MYSQL_PORT=21797 \
  -e MYSQL_DATABASE=pdf-generator-prod-8dk636da61e07 \
  -e MYSQL_USER=admin \
  -e MYSQL_PASSWORD=Kx7#mPqR2@nL9vZw \
  --name tennis-dna tennis-dna-test
```

## 🔒 安全注意事项

⚠️ **重要**：
1. `.env` 文件包含敏感信息，已添加到 `.gitignore`，不会被提交到代码仓库
2. 生产环境建议直接使用环境变量，而不是.env文件
3. 云服务器部署时，确保环境变量通过安全方式配置（如云平台的环境变量管理）
4. 定期更换数据库密码

## 📁 项目文件清单

| 文件 | 说明 |
|------|------|
| `main.py` | 后端API主文件（已更新） |
| `data.js` | 测试题目和类型定义 |
| `app.js` | 前端应用逻辑 |
| `share.js` | 分享功能 |
| `.env` | 环境变量配置文件（新增） |
| `requirements.txt` | Python依赖列表（已更新） |
| `Dockerfile` | Docker镜像构建文件（已更新） |
| `.gitignore` | Git忽略文件配置（新增） |
| `README.md` | 项目文档（新增） |
| `init_database.sql` | 数据库初始化脚本（新增） |
| `deploy.sh` | Linux部署脚本（新增） |
| `deploy.bat` | Windows部署脚本（新增） |
| `static/` | 前端静态文件目录 |
| `style.css` | 样式文件 |

## 🧪 测试验证

部署完成后，可以通过以下方式验证：

1. 访问首页：http://your-server-ip:8000
2. 访问API文档：http://your-server-ip:8000/docs
3. 测试API端点：
   - GET `/api/test_count` - 获取测试人数
   - POST `/api/submit_result` - 提交测试结果

## 📞 技术支持

如有问题，请参考 `README.md` 文档或检查应用日志。

---

**配置完成日期**: 2026-03-23
**配置内容**: 将数据库连接从本地MySQL切换到腾讯云MySQL数据库
