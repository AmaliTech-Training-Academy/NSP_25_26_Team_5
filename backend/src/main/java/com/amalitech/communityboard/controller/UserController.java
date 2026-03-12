package com.amalitech.communityboard.controller;

import com.amalitech.communityboard.config.JwtUtil;
import com.amalitech.communityboard.dto.AuthUserResponse;
import com.amalitech.communityboard.dto.UserRequest;
import com.amalitech.communityboard.model.User;
import com.amalitech.communityboard.model.enums.Role;
import com.amalitech.communityboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil; // inject JwtUtil

    // Create a new user account
    @PostMapping
    public ResponseEntity<AuthUserResponse> createUser(@RequestBody UserRequest userRequest) {
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            return ResponseEntity.badRequest().build();
        }

        User user = User.builder()
                .fullName(userRequest.getFullName())
                .email(userRequest.getEmail())
                .passwordHash(passwordEncoder.encode(userRequest.getPassword()))
                .role(userRequest.getRole() != null ? Role.valueOf(userRequest.getRole()) : Role.USER)
                .createdAt(LocalDateTime.now())
                .build();

        User saved = userRepository.save(user);

        // Generate real JWT token
        String token = jwtUtil.generateToken(saved);

        AuthUserResponse response = AuthUserResponse.builder()
                .token(token)
                .email(saved.getEmail())
                .fullName(saved.getFullName())
                .role(saved.getRole().name())
                .build();

        return ResponseEntity.ok(response);
    }

    // Get the currently authenticated user
    @GetMapping("/me")
    public ResponseEntity<AuthUserResponse> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        // Regenerate token for current user
        String token = jwtUtil.generateToken(user);

        AuthUserResponse response = AuthUserResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();

        return ResponseEntity.ok(response);
    }
}
