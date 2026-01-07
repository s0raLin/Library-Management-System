package com.cangli.service.impl;

import com.cangli.pojo.Admin;
import java.util.List;

public interface AdminServiceTrait {
    Admin findById(Integer id);
    List<Admin> findAll();
    Admin findByUsernameAndPassword(String username, String password);
}
