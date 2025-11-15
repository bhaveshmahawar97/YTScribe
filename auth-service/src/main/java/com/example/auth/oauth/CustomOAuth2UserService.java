package com.example.auth.oauth;

import com.example.auth.model.OAuthProviderInfo;
import com.example.auth.model.User;
import com.example.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = extractEmail(registrationId, attributes);
        String name = extractName(registrationId, attributes);
        String providerId = extractProviderId(registrationId, attributes);

        if (email == null) {
            log.warn("OAuth2 login without email from provider {}", registrationId);
            return oAuth2User;
        }

        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseGet(() -> User.builder()
                        .email(email.toLowerCase())
                        .fullName(name)
                        .roles(Set.of("ROLE_USER"))
                        .enabled(true)
                        .oauthProviders(List.of())
                        .build());

        if (user.getOauthProviders() == null) {
            user.setOauthProviders(List.of());
        }

        boolean alreadyLinked = user.getOauthProviders().stream()
                .anyMatch(p -> p.getProvider().equalsIgnoreCase(registrationId));
        if (!alreadyLinked) {
            var providers = new java.util.ArrayList<>(user.getOauthProviders());
            providers.add(OAuthProviderInfo.builder()
                    .provider(registrationId)
                    .providerId(providerId)
                    .build());
            user.setOauthProviders(providers);
        }

        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            user.setRoles(new HashSet<>(Set.of("ROLE_USER")));
        }

        user.setEnabled(true);
        userRepository.save(user);

        return oAuth2User;
    }

    private String extractEmail(String provider, Map<String, Object> attributes) {
        if ("google".equalsIgnoreCase(provider)) {
            return (String) attributes.get("email");
        }
        if ("github".equalsIgnoreCase(provider)) {
            return (String) attributes.get("email");
        }
        return (String) attributes.get("email");
    }

    private String extractName(String provider, Map<String, Object> attributes) {
        if ("google".equalsIgnoreCase(provider)) {
            return (String) attributes.getOrDefault("name", attributes.get("given_name"));
        }
        if ("github".equalsIgnoreCase(provider)) {
            return (String) attributes.getOrDefault("name", attributes.get("login"));
        }
        Object name = attributes.get("name");
        return name != null ? name.toString() : null;
    }

    private String extractProviderId(String provider, Map<String, Object> attributes) {
        Object id = attributes.get("sub");
        if (id == null) {
            id = attributes.get("id");
        }
        return id != null ? id.toString() : null;
    }
}
