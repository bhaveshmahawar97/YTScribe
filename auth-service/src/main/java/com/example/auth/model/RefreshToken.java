package com.example.auth.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "refresh_tokens")
public class RefreshToken {

    @Id
    private String id;

    // Store either a hash of the refresh token or a generated token identifier
    private String tokenId;

    private String userId;

    private Instant issuedAt;

    private Instant expiresAt;

    private boolean revoked;
}
