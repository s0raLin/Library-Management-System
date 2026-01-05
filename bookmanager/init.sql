use test;

-- 1. 管理员表
CREATE TABLE admin (
    id INT AUTO_INCREMENT COMMENT '管理员ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    role VARCHAR(20) DEFAULT '管理员' COMMENT '权限角色',
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- 2. 读者表
CREATE TABLE reader (
    id INT AUTO_INCREMENT COMMENT '读者ID',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    gender ENUM('男', '女', '未知') DEFAULT '未知' COMMENT '性别',
    class_dept VARCHAR(100) COMMENT '班级（如: 软件231， 计算机系）',
    reader_type ENUM('学生', '教师') NOT NULL COMMENT '读者类型',
    contact VARCHAR(100) COMMENT '联系方式（电话或邮箱）',
    borrow_limit INT DEFAULT 3 COMMENT '借书限额（学生默认3本，教师可设更高）',
    borrowed_count INT DEFAULT 0 COMMENT '当前已借数量',
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='读者表';

-- 3. 图书表
CREATE TABLE book (
    id INT AUTO_INCREMENT COMMENT '图书ID（内部主键）',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '图书编码（如：TP312-001）',
    title VARCHAR(200) NOT NULL COMMENT '书名',
    author VARCHAR(100) COMMENT '作者',
    publisher VARCHAR(100) COMMENT '出版社',
    isbn VARCHAR(20) COMMENT 'ISBN号',
    category VARCHAR(50) COMMENT '分类（如：文学、计算机、自然科学）',
    publish_date DATE COMMENT '出版日期',
    price DECIMAL(10,2) DEFAULT 0.00 COMMENT '价格',
    entry_date DATE NOT NULL COMMENT '入库日期',
    total_quantity INT NOT NULL DEFAULT 0 COMMENT '总数量（累计入库数量）',
    stock_quantity INT NOT NULL DEFAULT 0 COMMENT '当前库存量（可借数量）',
    borrow_times INT DEFAULT 0 COMMENT '被借阅次数',
    is_deleted TINYINT(1) DEFAULT 0 COMMENT '是否已删除：0-未删除，1-已删除',
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='图书表';

-- 5. 借阅记录表
CREATE TABLE borrow_record (
    id INT AUTO_INCREMENT COMMENT '借阅记录ID',
    book_id INT NOT NULL COMMENT '图书ID',
    reader_id INT NOT NULL COMMENT '读者ID',
    borrow_date DATE NOT NULL COMMENT '借出日期',
    due_date DATE NOT NULL COMMENT '应还日期',
    return_date DATE NULL COMMENT '实际还书日期（NULL表示未还）',
    overdue_fine DECIMAL(8,2) DEFAULT 0.00 COMMENT '逾期罚款金额',
    status ENUM('借出', '已还', '逾期') DEFAULT '借出' COMMENT '借阅状态',
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='借阅记录表';

-- 类别表
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE COMMENT '类别名称，如：文学、计算机等',
    code VARCHAR(10) NOT NULL UNIQUE COMMENT '类别代码，如：WX、JSJ等',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 插入默认类别数据
INSERT INTO categories (name, code)
VALUES
    ('文学', 'WX'),
    ('计算机', 'JSJ'),
    ('自然科学', 'ZRKX'),
    ('社会科学', 'SHKX'),
    ('艺术', 'YS'),
    ('历史', 'LS'),
    ('其他', 'QT');

-- 插入借阅记录测试数据

-- 1. 管理员表 示例数据（密码请使用加密存储，这里用明文示例，实际用bcrypt等加密）
INSERT INTO admin (username, password, role) VALUES
('admin', 'admin123', '管理员'),
('librarian1', 'lib123456', '管理员'),
('superadmin', 'super123', '超级管理员');

-- 2. 读者表 示例数据
INSERT INTO reader (name, gender, class_dept, reader_type, contact, borrow_limit, borrowed_count) VALUES
('张三', '男', '软件231', '学生', 'zhang@example.com', 3, 1),
('李四', '女', '计算机232', '学生', '13812345678', 3, 0),
('王老师', '男', '计算机系', '教师', 'wang@school.edu.cn', 10, 2),
('赵五', '未知', '软件241', '学生', 'zhao@example.com', 3, 0),
('刘教授', '女', '信息工程系', '教师', 'liu@school.edu.cn', 15, 0);

-- 3. 图书表 示例数据（category使用categories表中的name）
-- 假设总数量=库存量+已借出数量，这里部分有借出
INSERT INTO book (code, title, author, publisher, isbn, category, publish_date, price, entry_date, total_quantity, stock_quantity, borrow_times) VALUES
('TP312-001', 'C程序设计', '谭浩强', '清华大学出版社', '9787302040682', '计算机', '2005-01-01', 28.00, '2024-01-15', 10, 8, 15),
('TP312-002', 'Java编程思想', '[美] Bruce Eckel', '机械工业出版社', '9787111213826', '计算机', '2007-06-01', 108.00, '2024-02-20', 8, 6, 20),
('I246-001', '红楼梦', '曹雪芹', '人民文学出版社', '9787020002207', '文学', '1982-01-01', 59.70, '2023-12-10', 15, 14, 30),
('I247-002', '平凡的世界', '路遥', '北京十月文艺出版社', '9787530215593', '文学', '2012-03-01', 88.00, '2024-03-05', 12, 10, 25),
('N-001', '时间简史', '[英] 斯蒂芬·霍金', '湖南科学技术出版社', '9787535735195', '自然科学', '1998-01-01', 28.00, '2023-11-20', 20, 18, 40),
('Z-001', '相对论', '[德] 阿尔伯特·爱因斯坦', '上海科技教育出版社', '9787542830774', '自然科学', '2006-01-01', 25.00, '2024-04-01', 5, 5, 5),
('TP316-003', '算法导论', '[美] Thomas H. Cormen 等', '机械工业出版社', '978711۱۴۰7013', '计算机', '2012-09-01', 128.00, '2025-01-10', 6, 4, 10),
('I313-003', '活着', '余华', '作家出版社', '9787506365437', '文学', '2012-08-01', 20.00, '2025-06-15', 18, 18, 8);

-- 4. 借阅记录表 示例数据（部分已还、部分借出、部分逾期）
-- 假设应还日期为借出后30天
INSERT INTO borrow_record (book_id, reader_id, borrow_date, due_date, return_date, overdue_fine, status) VALUES
(1, 1, '2025-12-10', '2026-01-09', NULL, 0.00, '借出'),  -- 张三借C程序设计，未还
(2, 3, '2025-11-15', '2025-12-15', '2025-12-20', 5.00, '已还'),  -- 王老师借Java，已还逾期
(3, 1, '2025-10-01', '2025-10-31', '2025-11-05', 10.00, '逾期'),  -- 张三借红楼梦，已还但逾期
(5, 3, '2025-12-20', '2026-01-19', NULL, 0.00, '借出'),  -- 王老师借时间简史，未还
(7, 3, '2025-12-01', '2025-12-31', '2026-01-02', 2.50, '已还');  -- 王老师借算法导论，已还稍逾期
