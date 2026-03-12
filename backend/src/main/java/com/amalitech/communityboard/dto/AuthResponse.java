package com.amalitech.communityboard.dto;

import lombok.*;

// DTO returned after successful registration or login.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String email;
    private String fullName;
    private String role;
}
