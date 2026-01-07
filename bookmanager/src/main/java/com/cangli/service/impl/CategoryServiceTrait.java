package com.cangli.service.impl;

import com.cangli.pojo.Category;

import java.util.List;

public interface CategoryServiceTrait {

    List<Category> findAll();

    Category findById(Integer id);

    Category findByCode(String code);

    void addCategory(Category category);

    void updateCategory(Category category);

    void deleteCategory(Integer id);
}
