package com.cangli.mapper;

import com.cangli.pojo.Category;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface CategoryMapper {
    @Select("select * from categories")
    List<Category> findAll();
}
