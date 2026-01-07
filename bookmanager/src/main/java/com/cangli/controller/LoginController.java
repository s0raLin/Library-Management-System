package com.cangli.controller;

import com.cangli.pojo.Admin;
import com.cangli.pojo.Reader;
import com.cangli.pojo.Result;
import com.cangli.pojo.User;
import com.cangli.service.AdminService;
import com.cangli.service.ReaderService;
import com.cangli.utils.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


@RequestMapping("/login")
@RestController
public class LoginController {
    @Autowired
    ReaderService readerService;
    @Autowired
    AdminService adminService;

    @PostMapping()
    Result index(@RequestBody User user, HttpServletResponse res) {
        String username = user.getUsername();
        String password = user.getPassword();

        // 先尝试管理员登录
        Admin admin = adminService.findByUsernameAndPassword(username, password);
        if (admin != null) {
            String role = "admin";
            String token = JwtUtil.getToken(username, password, role);
            return Result.ok(new LoginResponse(token, admin, role));
        }

        // 再尝试读者登录
        Reader reader = readerService.findReaderByUserNameAndPassword(username, password);
        if (reader != null && reader.getUsername() != null && !reader.getUsername().isEmpty()) {
            String role = "reader";
            String token = JwtUtil.getToken(username, password, role);
            return Result.ok(new LoginResponse(token, reader, role));
        }

        return Result.error("用户名或密码错误");
    }

    static class LoginResponse {
        private String token;
        private Object user;
        private String role;

        public LoginResponse(String token, Object user, String role) {
            this.token = token;
            this.user = user;
            this.role = role;
        }

        public String getToken() { return token; }
        public Object getUser() { return user; }
        public String getRole() { return role; }
    }
}