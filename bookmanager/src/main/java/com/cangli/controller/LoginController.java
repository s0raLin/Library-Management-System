package com.cangli.controller;

import com.cangli.pojo.Result;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/login")
@RestController
public class LoginController {
    @PostMapping()
    Result index() {
        return Result.ok();
    }
}