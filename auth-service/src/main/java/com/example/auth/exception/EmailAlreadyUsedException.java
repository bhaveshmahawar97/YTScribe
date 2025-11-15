package com.example.auth.exception;

public class EmailAlreadyUsedException extends ApiException {
    public EmailAlreadyUsedException(String email) {
        super("EMAIL_ALREADY_USED", "Email already in use: " + email);
    }
}
