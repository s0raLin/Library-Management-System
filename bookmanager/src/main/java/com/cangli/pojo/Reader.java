package com.cangli.pojo;


import lombok.Data;

@Data
public class Reader {
    private Long id;
    private String name;
    private String gender;
    private String classDept;
    private String readerType;
    private String contact;
    private Integer borrowLimit = 3;
    private Integer borrowedCount = 0;

    private String username;
    private String password;
}