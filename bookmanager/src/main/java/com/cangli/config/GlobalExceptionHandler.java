package com.cangli.config;

import com.cangli.pojo.Result;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 处理 @Valid 校验失败
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );

        return Result.error(errors.toString());
    }
//
//    // 处理自定义业务异常（示例）
//    @ExceptionHandler(BusinessValidationException.class)
//    public ResponseEntity<Map<String, String>> handleBusinessException(BusinessValidationException ex) {
//        Map<String, String> body = new HashMap<>();
//        body.put("code", "BUSINESS_ERROR");
//        body.put("message", ex.getMessage());
//        return ResponseEntity.badRequest().body(body);
//    }

    // 其他异常
    @ExceptionHandler(Exception.class)
    public Result handleAll(Exception ex) {
        return Result.error(ex.toString());
    }
}