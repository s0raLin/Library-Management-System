package com.cangli.pojo;

import java.util.Date;

public class Book {
    private Long id; // 主键ID
    private String code; // 图书编号（馆内唯一编码）
    private String title; // 书名
    private String author; // 作者
    private String publisher; // 出版社
    private String isbn; // ISBN号
    private String category; // 分类/类别
    private Date publishDate; // 出版日期
    private Double price; // 价格（单位：元）
    private Date entryDate; // 入库日期
    private Integer totalQuantity; // 总数量（馆藏总数）
    private Integer stockQuantity; // 库存数量（当前可借数量）
    private Integer borrowTimes; // 借阅次数（累计被借阅次数）

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getPublisher() { return publisher; }
    public void setPublisher(String publisher) { this.publisher = publisher; }

    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Date getPublishDate() { return publishDate; }
    public void setPublishDate(Date publishDate) { this.publishDate = publishDate; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Date getEntryDate() { return entryDate; }
    public void setEntryDate(Date entryDate) { this.entryDate = entryDate; }

    public Integer getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(Integer totalQuantity) { this.totalQuantity = totalQuantity; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public Integer getBorrowTimes() { return borrowTimes; }
    public void setBorrowTimes(Integer borrowTimes) { this.borrowTimes = borrowTimes; }
}