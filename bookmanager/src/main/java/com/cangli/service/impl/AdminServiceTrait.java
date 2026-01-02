package com.cangli.service.impl;

import com.cangli.mapper.AdminMapper;
import com.cangli.pojo.Admin;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

public interface AdminServiceTrait {
    Admin findById(Integer id);
    List<Admin> findAll();
}
