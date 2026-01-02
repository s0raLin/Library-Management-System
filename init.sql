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
