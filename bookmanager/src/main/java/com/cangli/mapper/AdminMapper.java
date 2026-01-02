package com.cangli.mapper;

import com.cangli.pojo.Admin;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface AdminMapper {

    Admin findById(Integer id);

    List<Admin> findAll();
}



