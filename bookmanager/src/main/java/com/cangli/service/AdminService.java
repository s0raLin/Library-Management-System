package com.cangli.service;

import com.cangli.mapper.AdminMapper;
import com.cangli.pojo.Admin;
import com.cangli.service.impl.AdminServiceTrait;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService implements AdminServiceTrait {
    @Autowired
    private AdminMapper adminMapper;

    @Override
    public Admin findById(Integer id) {
        return adminMapper.findById(id);
    }

    @Override
    public List<Admin> findAll() {
        return adminMapper.findAll();
    }
}
