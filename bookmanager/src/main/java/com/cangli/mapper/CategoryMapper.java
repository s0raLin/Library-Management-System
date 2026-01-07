package com.cangli.mapper;

import com.cangli.pojo.Category;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface CategoryMapper {
    List<Category> findAll();

    Category findById(Integer id);

    Category findByCode(String code);

    void addCategory(Category category);

    void updateCategory(Category category);

    void deleteCategory(Integer id);
}
