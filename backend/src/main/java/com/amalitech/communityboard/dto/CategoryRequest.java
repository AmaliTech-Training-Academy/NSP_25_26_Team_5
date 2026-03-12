package com.amalitech.communityboard.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

// DTO for creating or updating a category (Admin only).

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CategoryRequest {

    @NotBlank(message = "Category name is required")
    private String name;
    private String description;
}
