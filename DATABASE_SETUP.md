# 📊 云数据库建表指南

## 数据库连接信息

```
主机: sh-cynosdbmysql-grp-5awkhsnm.sql.tencentcdb.com
端口: 21797
数据库: pdf-generator-prod-8dk636da61e07
用户名: admin
密码: Kx7#mPqR2@nL9vZw
```

## 🎯 建表方式选择

### 方式一：使用MySQL命令行（推荐）

#### 1. 安装MySQL客户端

**Windows:**
```cmd
# 下载MySQL Community Server并安装
# 或者使用免安装版
# 下载地址：https://dev.mysql.com/downloads/mysql/
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y mysql-client

# CentOS/RHEL
sudo yum install -y mysql
```

#### 2. 连接到云数据库

```bash
mysql -h sh-cynosdbmysql-grp-5awkhsnm.sql.tencentcdb.com -P 21797 -u admin -p'Kx7#mPqR2@nL9vZw' pdf-generator-prod-8dk636da61e07
```

或者交互式输入密码：
```bash
mysql -h sh-cynosdbmysql-grp-5awkhsnm.sql.tencentcdb.com -P 21797 -u admin -p pdf-generator-prod-8dk636da61e07
# 然后输入密码：Kx7#mPqR2@nL9vZw
```

#### 3. 执行建表脚本

连接成功后，执行以下SQL：

```sql
CREATE TABLE IF NOT EXISTS test_results (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    eng_name VARCHAR(100) COMMENT '英文名',
    chn_name VARCHAR(100) COMMENT '中文名',
    main_type VARCHAR(50) NOT NULL COMMENT '主DNA类型（beast/grinder/striker/social）',
    sub_type VARCHAR(50) COMMENT '副DNA类型',
    type_scores JSON COMMENT '各类型得分详情',
    level INT COMMENT '网球水平（1-4）',
    freq INT COMMENT '打球频率（1-4）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_main_type (main_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='网球DNA测试结果表';
```

#### 4. 验证表创建成功

```sql
-- 查看数据库中的表
SHOW TABLES;

-- 查看表结构
DESCRIBE test_results;

-- 查看建表语句
SHOW CREATE TABLE test_results;
```

---

### 方式二：使用MySQL Workbench（图形界面）

#### 1. 下载并安装MySQL Workbench
- 下载地址：https://dev.mysql.com/downloads/workbench/
- 支持Windows、macOS、Linux

#### 2. 创建新连接
- 打开MySQL Workbench
- 点击 "+" 添加新连接
- 填写连接信息：
  - **Connection Name**: 网球DNA测试数据库
  - **Hostname**: sh-cynosdbmysql-grp-5awkhsnm.sql.tencentcdb.com
  - **Port**: 21797
  - **Username**: admin
  - **Password**: Kx7#mPqR2@nL9vZw
  - **Default Schema**: pdf-generator-prod-8dk636da61e07

#### 3. 连接到数据库
- 点击连接
- 输入密码（如果需要）

#### 4. 执行建表SQL
- 打开新的SQL查询窗口（Ctrl+T）
- 复制上面的建表SQL
- 点击闪电图标执行

#### 5. 验证
- 在左侧导航栏查看表是否创建成功
- 右键表 -> Select Rows 查看数据

---

### 方式三：使用DBeaver（推荐，免费）

#### 1. 下载并安装DBeaver
- 下载地址：https://dbeaver.io/download/
- 支持Windows、macOS、Linux
- 免费且功能强大

#### 2. 创建新连接
- 打开DBeaver
- 点击 "New Database Connection"
- 选择 "MySQL"
- 填写连接信息：
  - **Host**: sh-cynosdbmysql-grp-5awkhsnm.sql.tencentcdb.com
  - **Port**: 21797
  - **Database**: pdf-generator-prod-8dk636da61e07
  - **Username**: admin
  - **Password**: Kx7#mPqR2@nL9vZw

#### 3. 测试连接
- 点击 "Test Connection"
- 下载驱动（如果需要）
- 确认连接成功

#### 4. 执行建表SQL
- 连接到数据库
- 打开SQL编辑器（Ctrl+L）
- 复制上面的建表SQL
- 执行SQL（Ctrl+Enter）

#### 5. 验证
- 在左侧数据库导航器中查看表
- 右键表 -> 查看数据

---

### 方式四：在服务器上执行（如果服务器上有MySQL客户端）

```bash
# SSH连接到服务器
ssh root@150.158.141.205

# 安装MySQL客户端
apt install -y mysql-client

# 连接到云数据库并执行建表
mysql -h sh-cynosdbmysql-grp-5awkhsnm.sql.tencentcdb.com -P 21797 -u admin -p'Kx7#mPqR2@nL9vZw' pdf-generator-prod-8dk636da61e07 << 'EOF'
CREATE TABLE IF NOT EXISTS test_results (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    eng_name VARCHAR(100) COMMENT '英文名',
    chn_name VARCHAR(100) COMMENT '中文名',
    main_type VARCHAR(50) NOT NULL COMMENT '主DNA类型（beast/grinder/striker/social）',
    sub_type VARCHAR(50) COMMENT '副DNA类型',
    type_scores JSON COMMENT '各类型得分详情',
    level INT COMMENT '网球水平（1-4）',
    freq INT COMMENT '打球频率（1-4）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_main_type (main_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='网球DNA测试结果表';
EOF
```

---

## 📋 表结构说明

### test_results 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键ID，自增 |
| eng_name | VARCHAR(100) | 英文名 |
| chn_name | VARCHAR(100) | 中文名 |
| main_type | VARCHAR(50) | 主DNA类型（beast/grinder/striker/social） |
| sub_type | VARCHAR(50) | 副DNA类型 |
| type_scores | JSON | 各类型得分详情 |
| level | INT | 网球水平（1-4） |
| freq | INT | 打球频率（1-4） |
| created_at | TIMESTAMP | 创建时间 |

### 索引
- `idx_main_type`: 主类型索引（加速按类型查询）
- `idx_created_at`: 创建时间索引（加速按时间排序）

---

## ✅ 验证建表成功

执行以下SQL验证：

```sql
-- 1. 查看表是否存在
SHOW TABLES;

-- 应该看到：
-- +-----------------------------------+
-- | Tables_in_pdf-generator-prod-8dk636da61e07 |
-- +-----------------------------------+
-- | test_results                      |
-- +-----------------------------------+

-- 2. 查看表结构
DESCRIBE test_results;

-- 3. 插入测试数据（可选）
INSERT INTO test_results (eng_name, chn_name, main_type, sub_type, type_scores, level, freq)
VALUES ('Test', '测试用户', 'beast', 'striker', '{"beast": 3, "grinder": 1, "striker": 2, "social": 2}', 2, 3);

-- 4. 查询测试数据
SELECT * FROM test_results;

-- 5. 删除测试数据（如果不需要）
DELETE FROM test_results WHERE eng_name = 'Test';
```

---

## ❗ 常见问题

### Q1: 连接失败 - Access denied
**A**: 检查：
- 用户名和密码是否正确
- 数据库用户是否有访问权限
- 数据库用户是否有操作权限

### Q2: 连接失败 - Host not allowed
**A**: 检查：
- 云数据库安全组是否允许你的IP访问
- 数据库用户是否允许从你的IP连接

### Q3: 表已存在错误
**A**: 使用 `CREATE TABLE IF NOT EXISTS` 语句，或者先删除表：
```sql
DROP TABLE IF EXISTS test_results;
```

### Q4: JSON字段不支持
**A**: 确认MySQL版本 >= 5.7.8（支持JSON类型）
```sql
SELECT VERSION();
```

---

## 📝 完整的建表SQL脚本

可以直接复制以下内容到SQL工具执行：

```sql
-- 网球DNA测试 - 数据库表创建脚本

CREATE TABLE IF NOT EXISTS test_results (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    eng_name VARCHAR(100) COMMENT '英文名',
    chn_name VARCHAR(100) COMMENT '中文名',
    main_type VARCHAR(50) NOT NULL COMMENT '主DNA类型（beast/grinder/striker/social）',
    sub_type VARCHAR(50) COMMENT '副DNA类型',
    type_scores JSON COMMENT '各类型得分详情',
    level INT COMMENT '网球水平（1-4）',
    freq INT COMMENT '打球频率（1-4）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_main_type (main_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='网球DNA测试结果表';

-- 验证表创建
SHOW TABLES;
DESCRIBE test_results;
```

---

## 🚀 建表完成后的下一步

表创建成功后，你就可以：

1. ✅ 部署应用到服务器
2. ✅ 测试应用与数据库的连接
3. ✅ 应用可以正常保存测试结果

---

**建议方式**：如果你是Windows用户，推荐使用 **DBeaver** 或 **MySQL Workbench**（图形界面更友好）。

**准备好了吗？选择一种方式开始建表吧！** 🎯
