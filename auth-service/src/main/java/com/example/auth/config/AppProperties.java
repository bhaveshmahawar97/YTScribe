package com.example.auth.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private String baseUrl;

    private Cors cors = new Cors();

    private Security security = new Security();

    private RateLimit rateLimit = new RateLimit();

    @Data
    public static class Cors {
        private String allowedOrigins;
    }

    @Data
    public static class Security {
        private int loginAttemptsMax;
        private int loginLockoutMinutes;
    }

    @Data
    public static class RateLimit {
        private int replenishPerMinute;
        private int burstCapacity;
    }
}
