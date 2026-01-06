package com.cangli.config;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.cangli.pojo.Reader;
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

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        System.out.println("Filter: " + "Method: " + request.getMethod() + ", Router: " + request.getRequestURI());

        // 允许登录和注册接口不验证token
        String requestURI = request.getRequestURI();
        if ("/login".equals(requestURI) && "POST".equals(request.getMethod())) {
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

            // 验证用户是否存在
            Reader reader = readerService.findReaderByUserNameAndPassword(username, password);
            if (reader == null) {
                response.setStatus(401);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"code\":401,\"msg\":\"用户不存在\"}");
                return;
            }

            // 将用户信息存储到request中，供后续使用
            request.setAttribute("currentUser", reader);
            filterChain.doFilter(request, response);

        } catch (Exception e) {
            response.setStatus(401);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":401,\"msg\":\"token无效或已过期\"}");
        }
    }
}