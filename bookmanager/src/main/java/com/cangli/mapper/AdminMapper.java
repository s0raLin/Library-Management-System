package com.cangli.mapper;

import com.cangli.pojo.Admin;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface AdminMapper {
    Admin findById(Integer id);

    List<Admin> findAll();

    @Select("select * from admin where username=#{username} and password=#{password}")
    Admin findByUsernameAndPassword(String username, String password);
}

