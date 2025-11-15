package com.example.auth.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, Object>> handleApiException(ApiException ex, HttpServletRequest request) {
        HttpStatus status = HttpStatus.BAD_REQUEST;
        if (ex instanceof InvalidCredentialsException) {
            status = HttpStatus.UNAUTHORIZED;
        } else if (ex instanceof AccountLockedException) {
            status = HttpStatus.LOCKED;
        }

        Map<String, Object> body = baseBody(status, ex.getCode(), ex.getMessage(), request.getRequestURI());
        return new ResponseEntity<>(body, status);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        HttpStatus status = HttpStatus.BAD_REQUEST;
        List<Map<String, String>> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(this::toError)
                .collect(Collectors.toList());
        Map<String, Object> body = baseBody(status, "VALIDATION_ERROR", "Validation failed", request.getRequestURI());
        body.put("errors", errors);
        return new ResponseEntity<>(body, status);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex, HttpServletRequest request) {
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        Map<String, Object> body = baseBody(status, "INTERNAL_ERROR", ex.getMessage(), request.getRequestURI());
        return new ResponseEntity<>(body, status);
    }

    private Map<String, Object> baseBody(HttpStatus status, String code, String message, String path) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("code", code);
        body.put("message", message);
        body.put("path", path);
        return body;
    }

    private Map<String, String> toError(FieldError fe) {
        Map<String, String> map = new HashMap<>();
        map.put("field", fe.getField());
        map.put("message", fe.getDefaultMessage());
        return map;
    }
}
