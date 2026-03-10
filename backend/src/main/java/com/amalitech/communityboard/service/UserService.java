package com.amalitech.communityboard.service;

import com.amalitech.communityboard.dto.UserResponse;
import com.amalitech.communityboard.exception.DuplicateEmailException;
import com.amalitech.communityboard.model.User;
import com.amalitech.communityboard.model.enums.Role;
import com.amalitech.communityboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Create new user
    public UserResponse createUser(User userRequest) {
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            log.warn("Attempt to register duplicate email: {}", userRequest.getEmail());
            throw new DuplicateEmailException("An account with this email already exists");
        }

        User user = User.builder()
                .fullName(userRequest.getFullName())
                .email(userRequest.getEmail())
                .passwordHash(passwordEncoder.encode(userRequest.getPasswordHash())) // hash password
                .role(userRequest.getRole() != null ? userRequest.getRole() : Role.USER)
                .createdAt(LocalDateTime.now())
                .build();

        User saved = userRepository.save(user);
        log.info("New user created: {}", saved.getEmail());

        return UserResponse.builder()
                .id(saved.getId())
                .fullName(saved.getFullName())
                .email(saved.getEmail())
                .role(saved.getRole().name())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    // Get current logged-in user
    public UserResponse getCurrentUser(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
