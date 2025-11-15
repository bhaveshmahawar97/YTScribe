package com.example.auth.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.Set;

@Data
@Builder
public class UserProfileResponse {

    private String id;
    private String fullName;
    private String email;
    private Set<String> roles;
    private boolean enabled;
    private Instant createdAt;
}
