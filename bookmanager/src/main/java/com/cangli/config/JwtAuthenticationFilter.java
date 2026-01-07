package com.cangli.config;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.cangli.pojo.Admin;
import com.cangli.pojo.Reader;
import com.cangli.service.AdminService;
import com.cangli.service.ReaderService;
import com.cangli.utils.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private ReaderService readerService;

    @Autowired
    private AdminService adminService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        System.out.println("Filter: " + "Method: " + request.getMethod() + ", Router: " + request.getRequestURI());

        // 允许登录和注册接口不验证token
        String requestURI = request.getRequestURI();
        if ("/login".equals(requestURI) || "/reader".equals(requestURI) && "POST".equals(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            response.setStatus(401);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":401,\"msg\":\"未登录或token无效\"}");
            return;
        }

        try {
            // 去掉Bearer前缀
            token = token.substring(7);
            DecodedJWT jwt = JwtUtil.parseToken(token);
            String username = jwt.getClaim("username").asString();
            String password = jwt.getClaim("password").asString();
            String role = jwt.getClaim("role").asString();

            Object currentUser = null;

            if ("admin".equals(role)) {
                // 验证管理员
                Admin admin = adminService.findByUsernameAndPassword(username, password);
                if (admin == null) {
                    response.setStatus(401);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"code\":401,\"msg\":\"管理员不存在\"}");
                    return;
                }
                currentUser = admin;
            } else if ("reader".equals(role)) {
                // 验证读者
                Reader reader = readerService.findReaderByUserNameAndPassword(username, password);
                if (reader == null) {
                    response.setStatus(401);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"code\":401,\"msg\":\"读者不存在\"}");
                    return;
                }
                currentUser = reader;
            } else {
                response.setStatus(401);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"code\":401,\"msg\":\"无效角色\"}");
                return;
            }

            // 将用户信息存储到request中，供后续使用
            request.setAttribute("currentUser", currentUser);
            request.setAttribute("currentRole", role);
            filterChain.doFilter(request, response);

        } catch (Exception e) {
            response.setStatus(401);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":401,\"msg\":\"token无效或已过期\"}");
        }
    }
}