package com.cangli.controller;

import com.cangli.pojo.Category;
import com.cangli.pojo.Result;
import com.cangli.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequestMapping("/categories")
@RestController
public class CategoryController {
    @Autowired
    private CategoryService categoryService;

    @GetMapping()
    Result index() {
        List<Category> categories = categoryService.findAll();
        return Result.ok(categories);
    }

    @PostMapping()
    Result addCategory() {
        return Result.ok();
    }
}
