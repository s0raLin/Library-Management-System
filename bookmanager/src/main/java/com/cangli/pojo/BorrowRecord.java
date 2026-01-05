package com.cangli.pojo;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class BorrowRecord {
    private Long id;                        // 主键
    private Long bookId;                    // 图书ID
    private Long readerId;                  // 读者ID
    private Date borrowDate;                // 借书时间
    private Date dueDate;                   // 应还时间
    private Date returnDate;                // 归还时间（未还为null）
    private BigDecimal overdueFine = BigDecimal.ZERO;  // 超期罚金
    private String status = "借出";         // 状态：借出、已还、逾期
    private String bookTitle;               // 图书书名（冗余存储）
    private String bookAuthor;              // 图书作者（冗余存储）
    private String bookIsbn;                // 图书ISBN（冗余存储）
    private String bookPublisher;           // 图书出版社（冗余存储）
    private String bookCategory;            // 图书分类（冗余存储）
}