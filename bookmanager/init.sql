create table admin (
    id int auto_increment comment '管理员ID' primary key,
    username varchar(50) not null comment '用户名',
    password varchar(255) not null comment '密码',
    role varchar(20) default '管理员' null comment '权限角色',
    constraint username unique (username)
) comment '管理员表' collate = utf8mb4_uca1400_ai_ci;

create table book (
    id int auto_increment comment '图书ID（内部主键）' primary key,
    code varchar(50) not null comment '图书编码（如：TP312-001）',
    title varchar(200) not null comment '书名',
    author varchar(100) null comment '作者',
    publisher varchar(100) null comment '出版社',
    isbn varchar(20) null comment 'ISBN号',
    category_id int not null comment '分类Id',
    publish_date date null comment '出版日期',
    price decimal(10, 2) default 0.00 null comment '价格',
    entry_date date not null comment '入库日期',
    borrow_times int default 0 null comment '被借阅次数',
    is_deleted tinyint(1) default 0 null comment '是否已删除：0-未删除，1-已删除',
    description text null comment '详情',
    cover_url varchar(255) null comment '封面页',
    constraint code unique (code)
) comment '图书表' collate = utf8mb4_uca1400_ai_ci;

create table book_items (
    id int auto_increment primary key,
    book_id int not null,
    barcode varchar(50) not null comment '每本书唯一的条码',
    location varchar(100) null comment '具体馆藏位置',
    status enum (
        'available',
        'borrowed',
        'unavailable',
        'deleted'
    ) default 'available' null,
    price_at_entry decimal(10, 2) null comment '入库时单价',
    entry_date date not null,
    notes varchar(255) null
) comment '图书实体表';

create table borrow_record (
    id int auto_increment comment '借阅记录ID' primary key,
    book_id int not null comment '图书ID',
    reader_id int not null comment '读者ID',
    borrow_date date not null comment '借出日期',
    due_date date not null comment '应还日期',
    return_date date null comment '实际还书日期（NULL表示未还）',
    overdue_fine decimal(8, 2) default 0.00 null comment '逾期罚款金额',
    status enum ('借出', '已还', '逾期', '丢失', '损坏') default '借出' null comment '借阅状态',
    item_id int not null comment '关联的具体书'
) comment '借阅记录表' collate = utf8mb4_uca1400_ai_ci;

create table borrow_rules (
    id int auto_increment primary key,
    reader_type enum ('学生', '教师') not null,
    max_books int not null comment '最大借阅数量',
    duration_days int not null comment '借阅时长(天)',
    renew_times int default 3 null comment '可续借次数',
    constraint reader_type unique (reader_type)
) comment '借阅规则表';

create table categories (
    id int auto_increment primary key,
    name varchar(50) not null comment '类别名称，如：文学、计算机等',
    code varchar(10) not null comment '类别代码，如：WX、JSJ等',
    created_at timestamp default current_timestamp() null,
    updated_at timestamp default current_timestamp() null on update current_timestamp(),
    constraint code unique (code),
    constraint name unique (name)
);

create table reader (
    id int auto_increment comment '读者ID' primary key,
    name varchar(50) not null comment '姓名',
    gender enum ('男', '女', '未知') default '未知' null comment '性别',
    class_dept varchar(100) null comment '班级（如: 软件231， 计算机系）',
    reader_type enum ('学生', '教师') not null comment '读者类型',
    contact varchar(100) null comment '联系方式（电话或邮箱）',
    borrow_limit int default 3 null comment '借书限额（学生默认3本，教师可设更高）',
    borrowed_count int default 0 null comment '当前已借数量',
    username varchar(20) not null comment '用户名',
    password varchar(20) not null comment '密码'
) comment '读者表' collate = utf8mb4_uca1400_ai_ci;

-- 插入默认数据
INSERT
    IGNORE INTO categories (name, code)
VALUES
    ('计算机', 'JSJ'),
    ('文学', 'WX'),
    ('自然科学', 'ZRKX');

INSERT
    IGNORE INTO borrow_rules (reader_type, max_books, duration_days)
VALUES
    ('学生', 3, 30),
    ('教师', 10, 60);

INSERT
    IGNORE INTO admin (username, password, role)
VALUES
    ('admin', '123456', '管理员');

INSERT INTO
    categories (name, code)
VALUES
    ('计算机科学', 'CS'),
    ('文学', 'WX'),
    ('历史', 'LS'),
    ('数学', 'SX'),
    ('外语', 'WY');

INSERT INTO
    book (
        code,
        title,
        author,
        publisher,
        isbn,
        category_id,
        publish_date,
        price,
        entry_date,
        borrow_times,
        description,
        cover_url
    )
VALUES
    (
        'CS101-001',
        'Java 核心技术',
        'Cay S. Horstmann',
        '机械工业出版社',
        '9787111213826',
        1,
        '2020-01-01',
        128.00,
        '2024-09-01',
        12,
        'Java 经典入门与进阶书籍',
        'https://example.com/java.jpg'
    ),
    (
        'CS102-001',
        '深入理解计算机系统',
        'Randal E. Bryant',
        '机械工业出版社',
        '9787111544937',
        1,
        '2019-06-01',
        139.00,
        '2024-09-01',
        5,
        '计算机系统领域经典教材',
        'https://example.com/csapp.jpg'
    ),
    (
        'WX201-001',
        '三体',
        '刘慈欣',
        '重庆出版社',
        '9787536692930',
        2,
        '2008-01-01',
        88.00,
        '2024-09-02',
        20,
        '中国科幻里程碑作品',
        'https://example.com/santi.jpg'
    );

INSERT INTO
    book_items (
        book_id,
        barcode,
        location,
        status,
        price_at_entry,
        entry_date,
        notes
    )
VALUES
    -- 《Java 核心技术》
    (
        1,
        'BC-JAVA-0001',
        'A区-计算机-01架',
        'available',
        128.00,
        '2024-09-01',
        '全新'
    ),
    (
        1,
        'BC-JAVA-0002',
        'A区-计算机-01架',
        'borrowed',
        128.00,
        '2024-09-01',
        '书角轻微磨损'
    ),
    -- 《深入理解计算机系统》
    (
        2,
        'BC-CSAPP-0001',
        'A区-计算机-02架',
        'available',
        139.00,
        '2024-09-01',
        NULL
    ),
    (
        2,
        'BC-CSAPP-0002',
        'A区-计算机-02架',
        'unavailable',
        139.00,
        '2024-09-01',
        '封面损坏'
    ),
    -- 《三体》
    (
        3,
        'BC-ST-0001',
        'B区-文学-03架',
        'available',
        88.00,
        '2024-09-02',
        NULL
    ),
    (
        3,
        'BC-ST-0002',
        'B区-文学-03架',
        'borrowed',
        88.00,
        '2024-09-02',
        '热门书籍'
    );