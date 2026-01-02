package com.cangli.mapper;

import com.cangli.pojo.Category;
import com.cangli.pojo.Result;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Mapper
public interface CategoryMapper {
    @Select("select * from categories")
    List<Category> findAll();

}
