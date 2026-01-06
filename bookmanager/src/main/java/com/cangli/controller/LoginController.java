package com.cangli.controller;

import com.cangli.pojo.Reader;
import com.cangli.pojo.Result;
import com.cangli.pojo.User;
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
    @PostMapping()
    Result index(@RequestBody User user, HttpServletResponse res) {
        Reader find = readerService.findReaderByUserNameAndPassword(user.getUsername(), user.getPassword());

        System.out.println("Login: "+user);
        if (find == null || find.getUsername() == null || find.getUsername().isEmpty()) {
            return Result.error("用户名或密码错误");
        }
        String username = user.getUsername();
        String password = user.getPassword();
        String role = username.equals("admin") ? "admin" : "reader";
        String token = JwtUtil.getToken(username, password, role);

        // 返回包含token和用户信息的对象
        return Result.ok(new LoginResponse(token, find, role));
    }

    static class LoginResponse {
        private String token;
        private Reader user;
        private String role;

        public LoginResponse(String token, Reader user, String role) {
            this.token = token;
            this.user = user;
            this.role = role;
        }

        public String getToken() { return token; }
        public Reader getUser() { return user; }
        public String getRole() { return role; }
    }
}