package com.cangli.pojo;

import java.math.BigDecimal;
import java.util.Date;

public class BorrowRecord {
    private Long id;                        // 主键
    private Long bookId;                    // 图书ID
    private Long readerId;                  // 读者ID
    private Date borrowDate;                // 借书时间
    private Date dueDate;                   // 应还时间
    private Date returnDate;                // 归还时间（未还为null）
    private BigDecimal overdueFine = BigDecimal.ZERO;  // 超期罚金
    private String status = "借出";         // 状态：借出、已还、逾期

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }

    public Long getReaderId() { return readerId; }
    public void setReaderId(Long readerId) { this.readerId = readerId; }

    public Date getBorrowDate() { return borrowDate; }
    public void setBorrowDate(Date borrowDate) { this.borrowDate = borrowDate; }

    public Date getDueDate() { return dueDate; }
    public void setDueDate(Date dueDate) { this.dueDate = dueDate; }

    public Date getReturnDate() { return returnDate; }
    public void setReturnDate(Date returnDate) { this.returnDate = returnDate; }

    public BigDecimal getOverdueFine() { return overdueFine; }
    public void setOverdueFine(BigDecimal overdueFine) { this.overdueFine = overdueFine; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}