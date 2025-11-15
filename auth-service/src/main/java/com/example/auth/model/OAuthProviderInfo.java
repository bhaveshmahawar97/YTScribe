package com.example.auth.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OAuthProviderInfo {

    private String provider; // e.g. "google", "github"

    private String providerId; // sub / id from provider
}
