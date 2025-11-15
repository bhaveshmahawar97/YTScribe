package com.example.auth.controller;

import com.example.auth.dto.UserProfileResponse;
import com.example.auth.model.User;
import com.example.auth.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserProfileResponse>> listUsers(Pageable pageable) {
        Page<User> users = userService.listUsers(pageable);
        Page<UserProfileResponse> dtoPage = users.map(userService::toProfileResponse);
        return ResponseEntity.ok(dtoPage);
    }
}
