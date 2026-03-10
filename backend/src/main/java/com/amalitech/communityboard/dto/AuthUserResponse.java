package com.amalitech.communityboard.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthUserResponse {
    private String token;
    private String email;
    private String fullName;
    private String role;
}
