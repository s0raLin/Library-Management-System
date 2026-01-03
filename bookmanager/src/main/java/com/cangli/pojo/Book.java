package com.cangli.pojo;

import lombok.Data;

import java.util.Date;

@Data
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
}