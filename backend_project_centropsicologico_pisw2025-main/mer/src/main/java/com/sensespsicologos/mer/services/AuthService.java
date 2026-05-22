package com.sensespsicologos.mer.services;

import com.sensespsicologos.mer.dtos.request.LoginRequest;
import com.sensespsicologos.mer.dtos.response.AuthResponse;
import com.sensespsicologos.mer.dtos.response.UserResponse;
import com.sensespsicologos.mer.models.User;
import com.sensespsicologos.mer.repositories.UserRepository;
import com.sensespsicologos.mer.security.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Value("${application.security.jwt.cookie.secure:false}")
    private boolean secureCookie;

    private static final String TOKEN_COOKIE_NAME = "auth_token";
    private static final String REFRESH_COOKIE_NAME = "refresh_token";

    @Transactional
    public AuthResponse login(LoginRequest loginRequest, HttpServletResponse response) {
        try {
            // Autenticar usuario
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            User user = (User) authentication.getPrincipal();

            // Obtener roles del usuario
            Set<String> roles = user.getRoles().stream()
                    .map(role -> role.getName().name())
                    .collect(Collectors.toSet());

            // Generar tokens
            String accessToken = jwtService.generateTokenWithRoles(user, roles);
            String refreshToken = jwtService.generateRefreshToken(user);

            // Establecer cookies
            setAuthCookies(response, accessToken, refreshToken);

            log.info("User logged in successfully: {}", user.getEmail());

            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .user(UserResponse.builder()
                            .id(user.getId().toString())
                            .email(user.getEmail())
                            .firstName(user.getFirstName())
                            .lastName(user.getLastName())
                            .dni(user.getDni())
                            .csp(user.getCsp())
                            .roles(roles)
                            .build())
                    .build();

        } catch (Exception e) {
            log.error("Authentication failed for user: {}", loginRequest.getEmail(), e);
            throw new BadCredentialsException("Invalid email or password");
        }
    }

    public AuthResponse refreshToken(String refreshToken, HttpServletResponse response) {
        try {
            if (!StringUtils.hasText(refreshToken)) {
                throw new BadCredentialsException("Refresh token is required");
            }

            String username = jwtService.extractUsername(refreshToken);
            User user = userRepository.findByEmailAndIsActiveTrue(username)
                    .orElseThrow(() -> new BadCredentialsException("User not found"));

            if (!jwtService.isTokenValid(refreshToken, user)) {
                throw new BadCredentialsException("Invalid refresh token");
            }

            Set<String> roles = user.getRoles().stream()
                    .map(role -> role.getName().name())
                    .collect(Collectors.toSet());

            // Generar nuevos tokens
            String newAccessToken = jwtService.generateTokenWithRoles(user, roles);
            String newRefreshToken = jwtService.generateRefreshToken(user);

            // Actualizar cookies
            setAuthCookies(response, newAccessToken, newRefreshToken);

            log.debug("Tokens refreshed for user: {}", username);

            return AuthResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .tokenType("Bearer")
                    .user(UserResponse.builder()
                            .id(user.getId().toString())
                            .email(user.getEmail())
                            .firstName(user.getFirstName())
                            .lastName(user.getLastName())
                            .dni(user.getDni())
                            .csp(user.getCsp())
                            .roles(roles)
                            .build())
                    .build();

        } catch (Exception e) {
            log.error("Token refresh failed", e);
            throw new BadCredentialsException("Invalid refresh token");
        }
    }

    public void logout(HttpServletRequest request, HttpServletResponse response) {
        // Limpiar cookies
        clearAuthCookies(response);
        log.info("User logged out");
    }

    public UserResponse getCurrentUser(User user) {
        Set<String> roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());

        return UserResponse.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .dni(user.getDni())
                .csp(user.getCsp())
                .roles(roles)
                .build();
    }

    public boolean validateToken(HttpServletRequest request) {
        try {
            String token = extractTokenFromRequest(request);
            if (!StringUtils.hasText(token)) {
                return false;
            }

            String username = jwtService.extractUsername(token);
            User user = userRepository.findByEmailAndIsActiveTrue(username)
                    .orElseThrow(() -> new BadCredentialsException("User not found"));

            return jwtService.isTokenValid(token, user);
        } catch (Exception e) {
            log.debug("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    private void setAuthCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        // Cookie para access token (15 minutos)
        Cookie accessCookie = createSecureCookie(TOKEN_COOKIE_NAME, accessToken, 15 * 60);
        response.addCookie(accessCookie);

        // Cookie para refresh token (7 días)
        Cookie refreshCookie = createSecureCookie(REFRESH_COOKIE_NAME, refreshToken, 7 * 24 * 60 * 60);
        response.addCookie(refreshCookie);
    }

    private void clearAuthCookies(HttpServletResponse response) {
        Cookie accessCookie = createSecureCookie(TOKEN_COOKIE_NAME, "", 0);
        Cookie refreshCookie = createSecureCookie(REFRESH_COOKIE_NAME, "", 0);

        response.addCookie(accessCookie);
        response.addCookie(refreshCookie);
    }

    private Cookie createSecureCookie(String name, String value, int maxAge) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setSecure(secureCookie);
        cookie.setPath("/");
        cookie.setMaxAge(maxAge);
        return cookie;
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        // Buscar en cookies primero
        if (request.getCookies() != null) {
            String tokenFromCookie = Arrays.stream(request.getCookies())
                    .filter(cookie -> TOKEN_COOKIE_NAME.equals(cookie.getName()))
                    .findFirst()
                    .map(Cookie::getValue)
                    .orElse(null);
            if (StringUtils.hasText(tokenFromCookie)) {
                return tokenFromCookie;
            }
        }

        // Buscar en Authorization header como fallback
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        return null;
    }
}