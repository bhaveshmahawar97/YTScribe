package com.example.auth.config;

import com.example.auth.model.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
public class JwtTokenProvider {

    private final Key key;
    private final long accessTokenExpirationSeconds;
    private final long refreshTokenExpirationSeconds;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-expiration}") long accessTokenExpirationSeconds,
            @Value("${jwt.refresh-token-expiration}") long refreshTokenExpirationSeconds) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessTokenExpirationSeconds = accessTokenExpirationSeconds;
        this.refreshTokenExpirationSeconds = refreshTokenExpirationSeconds;
    }

    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(accessTokenExpirationSeconds);
        return Jwts.builder()
                .setSubject(user.getId())
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiry))
                .claim("email", user.getEmail())
                .claim("roles", user.getRoles())
                .claim("type", "access")
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(User user, String tokenId) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(refreshTokenExpirationSeconds);
        return Jwts.builder()
                .setSubject(user.getId())
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiry))
                .claim("email", user.getEmail())
                .claim("roles", user.getRoles())
                .claim("type", "refresh")
                .claim("jti", tokenId)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(User user) {
        return generateRefreshToken(user, UUID.randomUUID().toString());
    }

    public Jws<Claims> validateAndParse(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            throw e;
        }
    }

    public boolean isAccessToken(Jws<Claims> claimsJws) {
        Object type = claimsJws.getBody().get("type");
        return "access".equals(type);
    }

    public boolean isRefreshToken(Jws<Claims> claimsJws) {
        Object type = claimsJws.getBody().get("type");
        return "refresh".equals(type);
    }

    public String getUserId(Jws<Claims> claimsJws) {
        return claimsJws.getBody().getSubject();
    }

    public String getTokenId(Jws<Claims> claimsJws) {
        Object jti = claimsJws.getBody().get("jti");
        return jti != null ? jti.toString() : null;
    }

    public Map<String, Object> getClaims(String token) {
        return validateAndParse(token).getBody();
    }

    public long getAccessTokenExpirationSeconds() {
        return accessTokenExpirationSeconds;
    }

    public long getRefreshTokenExpirationSeconds() {
        return refreshTokenExpirationSeconds;
    }
}
