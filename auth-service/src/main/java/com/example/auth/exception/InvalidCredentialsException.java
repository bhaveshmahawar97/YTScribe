package com.example.auth.exception;

public class InvalidCredentialsException extends ApiException {
    public InvalidCredentialsException() {
        super("INVALID_CREDENTIALS", "Invalid email or password");
    }
}
