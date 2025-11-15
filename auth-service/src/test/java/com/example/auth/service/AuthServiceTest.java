package com.example.auth.service;

import com.example.auth.config.AppProperties;
import com.example.auth.config.JwtTokenProvider;
import com.example.auth.dto.ForgotPasswordRequest;
import com.example.auth.dto.LoginRequest;
import com.example.auth.dto.SignupRequest;
import com.example.auth.exception.EmailAlreadyUsedException;
import com.example.auth.exception.InvalidCredentialsException;
import com.example.auth.model.User;
import com.example.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @Mock
    private TokenService tokenService;
    @Mock
    private EmailService emailService;
    @Mock
    private AppProperties appProperties;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        AppProperties.Security sec = new AppProperties.Security();
        sec.setLoginAttemptsMax(5);
        sec.setLoginLockoutMinutes(15);
        when(appProperties.getSecurity()).thenReturn(sec);
        when(jwtTokenProvider.getAccessTokenExpirationSeconds()).thenReturn(900L);
    }

    @Test
    void signup_createsUserAndSendsVerification() {
        SignupRequest req = new SignupRequest();
        req.setFullName("Test User");
        req.setEmail("test@example.com");
        req.setPassword("Passw0rd!");

        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("HASH");
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        authService.signup(req);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();
        assertEquals("test@example.com", saved.getEmail());
        assertEquals(Set.of("ROLE_USER"), saved.getRoles());
        assertFalse(saved.isEnabled());
        verify(emailService).sendVerificationEmail(any(), anyString());
    }

    @Test
    void signup_throwsWhenEmailExists() {
        SignupRequest req = new SignupRequest();
        req.setFullName("Test User");
        req.setEmail("test@example.com");
        req.setPassword("Passw0rd!");

        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThrows(EmailAlreadyUsedException.class, () -> authService.signup(req));
    }

    @Test
    void signin_successful() {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@example.com");
        req.setPassword("Passw0rd!");

        User user = User.builder()
                .id("123")
                .email("test@example.com")
                .passwordHash("HASH")
                .roles(Set.of("ROLE_USER"))
                .enabled(true)
                .build();

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Passw0rd!", "HASH")).thenReturn(true);
        when(jwtTokenProvider.generateAccessToken(user)).thenReturn("access");
        when(tokenService.createRefreshToken(user)).thenReturn("refresh");

        var resp = authService.signin(req);
        assertEquals("access", resp.getAccessToken());
        assertEquals("refresh", resp.getRefreshToken());
        assertEquals("test@example.com", resp.getUser().getEmail());
    }

    @Test
    void signin_invalidPasswordIncrementsAttempts() {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@example.com");
        req.setPassword("wrong");

        User user = User.builder()
                .id("123")
                .email("test@example.com")
                .passwordHash("HASH")
                .roles(Set.of("ROLE_USER"))
                .enabled(true)
                .failedLoginAttempts(0)
                .build();

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "HASH")).thenReturn(false);

        assertThrows(InvalidCredentialsException.class, () -> authService.signin(req));
        assertEquals(1, user.getFailedLoginAttempts());
        verify(userRepository, atLeastOnce()).save(user);
    }

    @Test
    void forgotPassword_sendsEmailIfUserExists() {
        ForgotPasswordRequest req = new ForgotPasswordRequest();
        req.setEmail("test@example.com");

        User user = User.builder().id("123").email("test@example.com").build();
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        authService.forgotPassword(req);

        verify(emailService).sendPasswordResetEmail(eq(user), anyString());
    }
}
