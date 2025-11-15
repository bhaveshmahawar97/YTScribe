package com.example.auth.exception;

public class AccountLockedException extends ApiException {
    public AccountLockedException(long minutes) {
        super("ACCOUNT_LOCKED", "Account locked due to too many failed attempts. Try again in " + minutes + " minutes.");
    }
}
