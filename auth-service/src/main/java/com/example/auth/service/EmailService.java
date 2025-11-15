package com.example.auth.service;

import com.example.auth.config.AppProperties;
import com.example.auth.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final AppProperties appProperties;

    public void sendVerificationEmail(User user, String token) {
        String link = appProperties.getBaseUrl() + "/verify-email?token=" + token;
        String subject = "Verify your email";
        String text = "Click the link to verify your email: " + link;

        sendEmail(user.getEmail(), subject, text);
    }

    public void sendPasswordResetEmail(User user, String token) {
        String link = appProperties.getBaseUrl() + "/reset-password?token=" + token;
        String subject = "Reset your password";
        String text = "Click the link to reset your password: " + link;

        sendEmail(user.getEmail(), subject, text);
    }

    private void sendEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("Sent email to {} with subject {}", to, subject);
        } catch (Exception ex) {
            log.warn("Failed to send email to {}: {}", to, ex.getMessage());
        }
    }
}
