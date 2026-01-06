package com.cangli.service.impl;

import com.cangli.pojo.Category;

import java.util.List;

public interface CategoryServiceTrait {
    List<Category> findAll();

    Category findById(Integer id);
}
