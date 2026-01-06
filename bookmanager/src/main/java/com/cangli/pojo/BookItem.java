package com.cangli.pojo;

import lombok.Data;

import java.util.Date;

@Data
public class BookItem {
    private Integer id;
    private Integer bookId;
    private String barcode;
    private String location;
    private String status;
    private Double priceAtEntry;
    private Date entryDate;
    private String notes;
}
