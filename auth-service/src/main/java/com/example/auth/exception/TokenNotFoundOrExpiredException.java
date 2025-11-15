package com.example.auth.exception;

public class TokenNotFoundOrExpiredException extends ApiException {
    public TokenNotFoundOrExpiredException() {
        super("TOKEN_INVALID", "Token is invalid or expired");
    }
}
