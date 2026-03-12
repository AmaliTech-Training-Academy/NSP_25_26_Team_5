package com.amalitech.communityboard.model;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UploadResponse {

    private String imageUrl;
    private String fileName;
    private String status;
    private String message;
    private long size;
    private String contentType;
}
