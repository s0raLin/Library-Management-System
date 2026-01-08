package com.cangli.config;

import com.cangli.pojo.Result;
import org.springframework.dao.DataAccessException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );

        // 将验证错误转换为更友好的格式
        String errorMsg;
        if (errors.size() == 1) {
            Map.Entry<String, String> singleError = errors.entrySet().iterator().next();
            errorMsg = String.format("字段 '%s' %s", singleError.getKey(), singleError.getValue());
        } else {
            String errorList = errors.entrySet().stream()
                    .map(entry -> String.format("'%s': %s", entry.getKey(), entry.getValue()))
                    .collect(Collectors.joining("; "));
            errorMsg = "输入信息有误：" + errorList;
        }
        return Result.error(errorMsg);
    }

    // 处理参数异常
    @ExceptionHandler(IllegalArgumentException.class)
    public Result handleIllegalArgumentException(IllegalArgumentException ex) {
        return Result.error("请求参数无效：" + ex.getMessage());
    }

    // 处理空指针异常
    @ExceptionHandler(NullPointerException.class)
    public Result handleNullPointerException(NullPointerException ex) {
        return Result.error("系统内部错误，请稍后重试");
    }

    // 处理数据库访问异常
    @ExceptionHandler(DataAccessException.class)
    public Result handleDataAccessException(DataAccessException ex) {
        return Result.error("数据库操作失败，请稍后重试");
    }


    // 处理其他异常
    @ExceptionHandler(Exception.class)
    public Result handleAll(Exception ex) {
        // 记录日志（这里可以添加日志记录）
        // logger.error("未处理的异常", ex);

        // 截断异常消息，使其用户友好
        String message = ex.getMessage();
        if (message != null && !message.isEmpty()) {
            // 截断消息到100个字符，避免暴露敏感信息
            if (message.length() > 100) {
                message = message.substring(0, 100) + "...";
            }
            // 移除可能的技术细节，如类名等
            message = message.replaceAll("java\\..*", "系统错误");
            message = message.replaceAll("org\\..*", "系统错误");
            message = message.replaceAll("com\\..*", "系统错误");
        } else {
            message = "系统发生未知错误";
        }

        return Result.error(message + "，请联系管理员");
    }
}