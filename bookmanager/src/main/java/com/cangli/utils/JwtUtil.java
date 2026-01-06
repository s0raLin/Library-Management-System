package com.cangli.utils;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.*;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;

import java.util.Date;


public class JwtUtil {
    private static final String SECRET = "secret";
    public static String getToken(String username, String password, String role){

        Algorithm algorithm = Algorithm.HMAC256(SECRET); // 使用HMAC256加密算法
        String token = JWT.create()
                .withIssuer("auth0")  // issuer 签发者
                .withIssuedAt(new Date(System.currentTimeMillis()))
                .withExpiresAt(new Date(System.currentTimeMillis()+7200*1000)) // token过期时间 2H
                .withAudience("app") // 校验jwt的一方
                .withClaim("username",username) // 自定义存储的数据
                .withClaim("password", password)
                .withClaim("role",role)
                .sign(algorithm); // token加签加密

        return token;
    }

    // 解析JWT
    public static DecodedJWT parseToken(String token) {
        Algorithm algorithm = Algorithm.HMAC256(SECRET);
        JWTVerifier verifier = JWT.require(algorithm).build();
        return verifier.verify(token);
    }

    /**
     * 校验token是否正确
     * @param token
     * @return
     */
    public static DecodedJWT verifyToken(String token){

        return  JWT.require(Algorithm.HMAC256("secret")).build().verify(token);
    }

    /**
     * 校验token，捕获异常并返回错误信息
     * @param token
     * @return
     */
    public static String  checkToken(String token){

        try {

            verifyToken(token);
            return "token正确";
        }catch (SignatureVerificationException e){

            return "无效签名";
        }catch (TokenExpiredException e){

            return "token过期";
        }catch (AlgorithmMismatchException e){

            return "token算法不一致";
        }catch (Exception e){

            return "token无效";
        }
    }


}
