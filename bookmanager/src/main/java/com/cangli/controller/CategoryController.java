package com.cangli.controller;

import com.cangli.pojo.Category;
import com.cangli.pojo.Result;
import com.cangli.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/categories")
@RestController
public class CategoryController {
    @Autowired
    private CategoryService categoryService;

    @GetMapping()
    Result getCategories() {
        List<Category> categories = categoryService.findAll();
        return Result.ok(categories);
    }

    @GetMapping("/{id}")
    Result getCategory(@PathVariable Integer id) {
        Category category = categoryService.findById(id);
        return Result.ok(category);
    }

    @PostMapping()
    Result addCategory(@RequestBody Category category) {
        categoryService.addCategory(category);
        return Result.ok(category);
    }

    @PutMapping("/{id}")
    Result updateCategory(@PathVariable Integer id, @RequestBody Category category) {
        category.setId(id.longValue());
        categoryService.updateCategory(category);
        return Result.ok(category);
    }

    @DeleteMapping("/{id}")
    Result deleteCategory(@PathVariable Integer id) {
        categoryService.deleteCategory(id);
        return Result.ok();
    }
}
