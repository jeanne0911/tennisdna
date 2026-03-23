-- 网球DNA测试 - 数据库初始化脚本
-- 使用方法：在MySQL数据库中执行此脚本

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

-- 可选：插入一条测试数据（用于验证连接）
-- INSERT INTO test_results (eng_name, chn_name, main_type, sub_type, type_scores, level, freq)
-- VALUES ('Test', '测试用户', 'beast', 'striker', '{"beast": 3, "grinder": 1, "striker": 2, "social": 2}', 2, 3);
