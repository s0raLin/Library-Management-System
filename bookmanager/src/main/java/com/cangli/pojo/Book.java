package com.cangli.pojo;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class Book {
    private Long id; // 主键ID
    private String code; // 图书编号（馆内唯一编码）
    @NotBlank(message = "书名不能为空")
    private String title; // 书名
    @NotBlank(message = "图书作者不能为空")
    private String author; // 作者
    private String publisher; // 出版社
    private String isbn; // ISBN号
    private Integer categoryId; // 分类/类别 id
    private String category; // 分类/类别
    private Date publishDate; // 出版日期
    @DecimalMin(value = "0.0", inclusive = true, message = "价格不能为负数")
    private Double price; // 价格（单位：元）
    private Date entryDate; // 入库日期
    private Integer borrowTimes; // 借阅次数（累计被借阅次数）
    private Integer isDeleted; // 是否被删除 0未删除/1已删除
    private String description; // 描述
    private String coverUrl; // 封面链接

    private List<BookItem> bookItems;
}