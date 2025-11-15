package com.example.auth.service;

import com.example.auth.config.JwtTokenProvider;
import com.example.auth.exception.TokenNotFoundOrExpiredException;
import com.example.auth.model.RefreshToken;
import com.example.auth.model.User;
import com.example.auth.model.VerificationToken;
import com.example.auth.model.VerificationToken.TokenType;
import com.example.auth.repository.RefreshTokenRepository;
import com.example.auth.repository.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final VerificationTokenRepository verificationTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public String createVerificationToken(User user, TokenType type, long expiresInSeconds) {
        String token = UUID.randomUUID().toString();
        VerificationToken vt = VerificationToken.builder()
                .token(token)
                .userId(user.getId())
                .type(type)
                .expiresAt(Instant.now().plusSeconds(expiresInSeconds))
                .build();
        verificationTokenRepository.save(vt);
        return token;
    }

    public VerificationToken consumeVerificationToken(String token, TokenType expectedType) {
        VerificationToken vt = verificationTokenRepository.findByToken(token)
                .orElseThrow(TokenNotFoundOrExpiredException::new);
        if (!expectedType.equals(vt.getType()) || vt.getExpiresAt().isBefore(Instant.now())) {
            throw new TokenNotFoundOrExpiredException();
        }
        verificationTokenRepository.delete(vt);
        return vt;
    }

    public String createRefreshToken(User user) {
        String tokenId = UUID.randomUUID().toString();
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(jwtTokenProvider.getRefreshTokenExpirationSeconds());
        RefreshToken rt = RefreshToken.builder()
                .tokenId(tokenId)
                .userId(user.getId())
                .issuedAt(now)
                .expiresAt(expiresAt)
                .revoked(false)
                .build();
        refreshTokenRepository.save(rt);
        return jwtTokenProvider.generateRefreshToken(user, tokenId);
    }

    public RefreshToken validateRefreshToken(String refreshToken) {
        var claimsJws = jwtTokenProvider.validateAndParse(refreshToken);
        if (!jwtTokenProvider.isRefreshToken(claimsJws)) {
            throw new TokenNotFoundOrExpiredException();
        }
        String tokenId = jwtTokenProvider.getTokenId(claimsJws);
        RefreshToken rt = refreshTokenRepository.findByTokenIdAndRevokedFalse(tokenId)
                .orElseThrow(TokenNotFoundOrExpiredException::new);
        if (rt.getExpiresAt().isBefore(Instant.now())) {
            throw new TokenNotFoundOrExpiredException();
        }
        return rt;
    }

    public void revokeRefreshToken(String refreshToken) {
        RefreshToken rt = validateRefreshToken(refreshToken);
        rt.setRevoked(true);
        refreshTokenRepository.save(rt);
    }
}
