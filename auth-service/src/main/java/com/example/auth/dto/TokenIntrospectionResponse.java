package com.example.auth.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class TokenIntrospectionResponse {

    private boolean active;
    private String userId;
    private String email;
    private Object roles;
    private Map<String, Object> claims;
}
