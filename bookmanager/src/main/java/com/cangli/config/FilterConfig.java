package com.cangli.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Objects;


class MyFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        System.out.println("Filter: "+"Method: "+request.getMethod()+", Router: "+ request.getRequestURI());
        // 前置处理...
//        if(Objects.equals(request.getRequestURI(), "/login")) {
//            filterChain.doFilter(request, response);  // 放行
//            System.out.println("用户登录");
//        }
        
        filterChain.doFilter(request, response);



        // 后置处理...
    }
}

@Configuration
public class FilterConfig {
    @Bean
    public FilterRegistrationBean<MyFilter> myFilterRegistration() {
        FilterRegistrationBean<MyFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new MyFilter());
        registration.addUrlPatterns("/*");                  // 拦截路径
        registration.setName("myFilter");
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);  // 执行顺序，值越小越先执行
        return registration;
    }
}
