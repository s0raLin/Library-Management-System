package com.cangli.pojo;

import lombok.Data;

@Data
public class Admin {
    private Integer id;
    private String username;
    private String password;
    private String role = "管理员";
}
