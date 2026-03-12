package com.amalitech.communityboard.service;

import com.amalitech.communityboard.dto.UserResponse;
import com.amalitech.communityboard.exception.ResourceNotFoundException;
import com.amalitech.communityboard.model.User;
import com.amalitech.communityboard.model.enums.Role;
import com.amalitech.communityboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
// Admin Service : handles admin-only operations like user management.
@Service
@RequiredArgsConstructor
public class AdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminService.class);

    private final UserRepository userRepository;

    // Returns a list of all registered users.
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toUserResponse)
                .toList();
    }

    // Updates a user's role.
    public UserResponse updateUserRole(Long userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        try {
            Role newRole = Role.valueOf(role.toUpperCase());
            user.setRole(newRole);
            userRepository.save(user);
            log.info("User {} role updated to {} by admin", user.getEmail(), newRole);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + role + ". Must be 'USER' or 'ADMIN'");
        }

        return toUserResponse(user);
    }

    // Deletes a user account.
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        userRepository.delete(user);
        log.info("User {} deleted by admin", user.getEmail());
    }

    // Converts a User entity to a UserResponse DTO.
    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
