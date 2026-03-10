package com.amalitech.communityboard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentRequest {

    @NotBlank(message = "Comment body must not be empty")
    @Size(max = 500, message = "Comment body must not exceed 500 characters")
    private String body;
}
