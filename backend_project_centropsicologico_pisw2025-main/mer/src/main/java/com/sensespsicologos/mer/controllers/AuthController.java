package com.sensespsicologos.mer.controllers;

import com.sensespsicologos.mer.dtos.request.LoginRequest;
import com.sensespsicologos.mer.dtos.request.RefreshTokenRequest;
import com.sensespsicologos.mer.dtos.response.AuthResponse;
import com.sensespsicologos.mer.dtos.response.UserResponse;
import com.sensespsicologos.mer.models.User;
import com.sensespsicologos.mer.services.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletResponse response) {

        AuthResponse authResponse = authService.login(loginRequest, response);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(
            @Valid @RequestBody RefreshTokenRequest refreshRequest,
            HttpServletResponse response) {

        AuthResponse authResponse = authService.refreshToken(refreshRequest.getRefreshToken(), response);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            HttpServletRequest request,
            HttpServletResponse response) {

        authService.logout(request, response);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal User user) {
        UserResponse userResponse = authService.getCurrentUser(user);
        return ResponseEntity.ok(userResponse);
    }

    @PostMapping("/validate")
    public ResponseEntity<Boolean> validateToken(HttpServletRequest request) {
        boolean isValid = authService.validateToken(request);
        return ResponseEntity.ok(isValid);
    }
}