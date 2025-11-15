package com.example.auth.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class JwtResponse {

    private String accessToken;
    private String refreshToken;
    private long expiresIn;
    private String tokenType;
    private UserInfo user;

    @Data
    @Builder
    public static class UserInfo {
        private String id;
        private String email;
        private Set<String> roles;
        private String fullName;
    }
}
