package com.cangli.pojo;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class BorrowRecord {
    private Long id;                        // 主键
    private Long bookId;                    // 图书ID
    private String bookTitle;               // 图书名
    private String bookCoverUrl;            // 图书封面
    private Long readerId;                  // 读者ID
    private Date borrowDate;                // 借书时间
    private Date dueDate;                   // 应还时间
    private Date returnDate;                // 归还时间（未还为null）
    private BigDecimal overdueFine = BigDecimal.ZERO;  // 超期罚金
    private String status = "借出";          // 状态：借出、已还、逾期, 损坏，丢失
    private Integer itemId;                 // 具体借的书
    private String itemBarcode;                 // 具体图书编码
}