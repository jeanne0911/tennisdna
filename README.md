# 网球DNA测试 - 部署指南

## 项目概述
这是一个基于FastAPI的H5网页应用，提供网球风格测试功能。

## 环境变量配置

本项目使用云数据库，需要配置以下环境变量：

### 方式一：使用.env文件（本地开发）

在项目根目录创建 `.env` 文件，内容如下：

```env
MYSQL_HOST=sh-cynosdbmysql-grp-5awkhsnm.sql.tencentcdb.com
MYSQL_PORT=21797
MYSQL_DATABASE=pdf-generator-prod-8dk636da61e07
MYSQL_USER=admin
MYSQL_PASSWORD=Kx7#mPqR2@nL9vZw
```

### 方式二：部署时设置环境变量

在部署平台（如腾讯云）中直接设置环境变量：

- `MYSQL_HOST`: 数据库主机地址
- `MYSQL_PORT`: 数据库端口
- `MYSQL_DATABASE`: 数据库名称
- `MYSQL_USER`: 数据库用户名
- `MYSQL_PASSWORD`: 数据库密码

## 本地开发

1. 安装依赖：
```bash
pip install -r requirements.txt
```

2. 配置环境变量（创建.env文件或设置系统环境变量）

3. 启动开发服务器：
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

4. 访问：http://localhost:8000

## Docker部署

1. 构建镜像：
```bash
docker build -t tennis-dna-test .
```

2. 运行容器：
```bash
docker run -d -p 8000:8000 \
  -e MYSQL_HOST=sh-cynosdbmysql-grp-5awkhsnm.sql.tencentcdb.com \
  -e MYSQL_PORT=21797 \
  -e MYSQL_DATABASE=pdf-generator-prod-8dk636da61e07 \
  -e MYSQL_USER=admin \
  -e MYSQL_PASSWORD=Kx7#mPqR2@nL9vZw \
  --name tennis-dna tennis-dna-test
```

## 云服务器部署

### 腾讯云部署示例

如果使用腾讯云服务，可以：

1. 上传代码到服务器
2. 安装依赖：`pip install -r requirements.txt`
3. 设置环境变量（直接在系统环境或使用.env文件）
4. 启动服务：
```bash
nohup uvicorn main:app --host 0.0.0.0 --port 8000 > app.log 2>&1 &
```

### 使用进程管理器（推荐）

使用PM2或Supervisor管理进程：

**使用PM2：**
```bash
npm install -g pm2
pm2 start uvicorn --name tennis-dna -- main:app --host 0.0.0.0 --port 8000
pm2 save
pm2 startup
```

## 数据库初始化

确保数据库中存在 `test_results` 表，表结构如下：

```sql
CREATE TABLE test_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    eng_name VARCHAR(100),
    chn_name VARCHAR(100),
    main_type VARCHAR(50) NOT NULL,
    sub_type VARCHAR(50),
    type_scores JSON,
    level INT,
    freq INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 安全注意事项

⚠️ **重要提醒**：
- `.env` 文件包含敏感信息，不要提交到版本控制系统
- 生产环境应该使用环境变量而非文件配置
- 定期更换数据库密码
- 使用强密码并定期更新

## 技术栈

- **后端**: FastAPI + Python
- **数据库**: MySQL (腾讯云数据库)
- **前端**: 原生 JavaScript + CSS
- **部署**: Docker / 云服务器
