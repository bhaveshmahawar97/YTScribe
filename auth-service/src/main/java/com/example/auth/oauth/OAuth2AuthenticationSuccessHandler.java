package com.example.auth.oauth;

import com.example.auth.config.AppProperties;
import com.example.auth.config.JwtTokenProvider;
import com.example.auth.dto.JwtResponse;
import com.example.auth.model.User;
import com.example.auth.repository.UserRepository;
import com.example.auth.service.TokenService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenService tokenService;
    private final AppProperties appProperties;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof DefaultOAuth2User)) {
            super.onAuthenticationSuccess(request, response, authentication);
            return;
        }
        DefaultOAuth2User oauthUser = (DefaultOAuth2User) principal;
        Map<String, Object> attributes = oauthUser.getAttributes();
        String email = (String) attributes.get("email");
        if (email == null) {
            super.onAuthenticationSuccess(request, response, authentication);
            return;
        }
        User user = userRepository.findByEmail(email.toLowerCase()).orElse(null);
        if (user == null) {
            super.onAuthenticationSuccess(request, response, authentication);
            return;
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = tokenService.createRefreshToken(user);
        long expiresIn = jwtTokenProvider.getAccessTokenExpirationSeconds();

        JwtResponse jwtResponse = JwtResponse.builder()
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

        String redirectUri = appProperties.getBaseUrl() + "/oauth2/redirect" +
                "?accessToken=" + urlEncode(jwtResponse.getAccessToken()) +
                "&refreshToken=" + urlEncode(jwtResponse.getRefreshToken()) +
                "&expiresIn=" + jwtResponse.getExpiresIn();

        log.info("OAuth2 login success for {}", user.getEmail());
        getRedirectStrategy().sendRedirect(request, response, redirectUri);
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
