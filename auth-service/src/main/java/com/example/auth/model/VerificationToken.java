package com.example.auth.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "verification_tokens")
public class VerificationToken {

    @Id
    private String id;

    @Indexed(unique = true)
    private String token;

    private String userId;

    private Instant expiresAt;

    private TokenType type;

    public enum TokenType {
        VERIFY,
        RESET
    }
}
