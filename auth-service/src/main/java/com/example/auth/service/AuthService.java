package com.example.auth.service;

import com.example.auth.config.AppProperties;
import com.example.auth.config.JwtTokenProvider;
import com.example.auth.dto.*;
import com.example.auth.exception.*;
import com.example.auth.model.User;
import com.example.auth.model.VerificationToken.TokenType;
import com.example.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenService tokenService;
    private final EmailService emailService;
    private final AppProperties appProperties;

    @Transactional
    public void signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyUsedException(request.getEmail());
        }
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .roles(Set.of("ROLE_USER"))
                .enabled(false)
                .failedLoginAttempts(0)
                .build();
        userRepository.save(user);

        String token = tokenService.createVerificationToken(user, TokenType.VERIFY, 24 * 60 * 60);
        emailService.sendVerificationEmail(user, token);

        log.info("New signup for email {}", user.getEmail());
    }

    @Transactional
    public void verifyEmail(String token) {
        var vt = tokenService.consumeVerificationToken(token, TokenType.VERIFY);
        User user = userRepository.findById(vt.getUserId())
                .orElseThrow(() -> new TokenNotFoundOrExpiredException());
        user.setEnabled(true);
        userRepository.save(user);
        log.info("Verified email for user {}", user.getEmail());
    }

    @Transactional
    public JwtResponse signin(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(InvalidCredentialsException::new);

        if (user.getAccountLockedUntil() != null && user.getAccountLockedUntil().isAfter(Instant.now())) {
            int minutes = appProperties.getSecurity().getLoginLockoutMinutes();
            throw new AccountLockedException(minutes);
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            handleFailedLogin(user);
            throw new InvalidCredentialsException();
        }

        if (!user.isEnabled()) {
            throw new ApiException("ACCOUNT_NOT_VERIFIED", "Account is not verified. Please check your email.");
        }

        resetLoginAttempts(user);

        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = tokenService.createRefreshToken(user);
        long expiresIn = jwtTokenProvider.getAccessTokenExpirationSeconds();

        log.info("Successful signin for {}", user.getEmail());

        return buildJwtResponse(user, accessToken, refreshToken, expiresIn);
    }

    @Transactional
    public JwtResponse refreshToken(RefreshTokenRequest request) {
        var refreshToken = tokenService.validateRefreshToken(request.getRefreshToken());
        User user = userRepository.findById(refreshToken.getUserId())
                .orElseThrow(TokenNotFoundOrExpiredException::new);
        if (!user.isEnabled()) {
            throw new ApiException("ACCOUNT_DISABLED", "Account is disabled");
        }
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        long expiresIn = jwtTokenProvider.getAccessTokenExpirationSeconds();
        return buildJwtResponse(user, accessToken, request.getRefreshToken(), expiresIn);
    }

    @Transactional
    public void signout(RefreshTokenRequest request) {
        tokenService.revokeRefreshToken(request.getRefreshToken());
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail().toLowerCase()).ifPresent(user -> {
            String token = tokenService.createVerificationToken(user, TokenType.RESET, 60 * 60);
            emailService.sendPasswordResetEmail(user, token);
            log.info("Password reset requested for {}", user.getEmail());
        });
        // Always return success to avoid leaking which emails exist.
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        var vt = tokenService.consumeVerificationToken(request.getToken(), TokenType.RESET);
        User user = userRepository.findById(vt.getUserId())
                .orElseThrow(TokenNotFoundOrExpiredException::new);
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password reset for {}", user.getEmail());
    }

    public TokenIntrospectionResponse introspect(String token) {
        try {
            var claimsJws = jwtTokenProvider.validateAndParse(token);
            String userId = claimsJws.getBody().getSubject();
            String email = (String) claimsJws.getBody().get("email");
            Object roles = claimsJws.getBody().get("roles");
            return TokenIntrospectionResponse.builder()
                    .active(true)
                    .userId(userId)
                    .email(email)
                    .roles(roles)
                    .claims(claimsJws.getBody())
                    .build();
        } catch (Exception ex) {
            log.warn("Token introspection failed: {}", ex.getMessage());
            return TokenIntrospectionResponse.builder()
                    .active(false)
                    .build();
        }
    }

    private void handleFailedLogin(User user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);
        if (attempts >= appProperties.getSecurity().getLoginAttemptsMax()) {
            user.setAccountLockedUntil(Instant.now().plus(appProperties.getSecurity().getLoginLockoutMinutes(), ChronoUnit.MINUTES));
            log.warn("Account locked for {} due to too many failed attempts", user.getEmail());
        }
        userRepository.save(user);
    }

    private void resetLoginAttempts(User user) {
        user.setFailedLoginAttempts(0);
        user.setAccountLockedUntil(null);
        userRepository.save(user);
    }

    public JwtResponse buildJwtResponse(User user, String accessToken, String refreshToken, long expiresIn) {
        return JwtResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(expiresIn)
                .tokenType("Bearer")
                .user(JwtResponse.UserInfo.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .roles(user.getRoles())
                        .fullName(user.getFullName())
                        .build())
                .build();
    }
}
