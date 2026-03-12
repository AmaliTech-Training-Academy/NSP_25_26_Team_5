package com.amalitech.communityboard.controller;

import com.amalitech.communityboard.dto.PostRequest;
import com.amalitech.communityboard.dto.PostResponse;
import com.amalitech.communityboard.model.User;
import com.amalitech.communityboard.service.ImageStorageService;
import com.amalitech.communityboard.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final ImageStorageService imageStorageService;

    // Get all posts with pagination
    @GetMapping
    public ResponseEntity<Page<PostResponse>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(postService.getAllPosts(page, size));
    }

    // Get a single post by ID
    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable Long id) {
        return ResponseEntity.ok(postService.getPostById(id));
    }

    // Search posts by keyword, category, and date range
    @GetMapping("/search")
    public ResponseEntity<Page<PostResponse>> searchPosts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(postService.searchPosts(keyword, category, startDate, endDate, page, size));
    }

    // Create a new post
    @PostMapping
    public ResponseEntity<PostResponse> createPost(
            @Valid @RequestBody PostRequest request,
            @AuthenticationPrincipal User author) {
        return ResponseEntity.ok(postService.createPost(request, author));
    }

    // Update an existing post
    @PutMapping("/{id}")
    public ResponseEntity<PostResponse> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody PostRequest request,
            @AuthenticationPrincipal User author) {
        return ResponseEntity.ok(postService.updatePost(id, request, author));
    }

    // Delete a post
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long id,
            @AuthenticationPrincipal User author) {
        postService.deletePost(id, author);
        return ResponseEntity.noContent().build();
    }

    // Upload image for a post
    @PostMapping("/{postId}/image")
    public ResponseEntity<PostResponse> uploadPostImage(
            @PathVariable Long postId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User author) throws IOException {

        // Store file and build URL
        String fileName = imageStorageService.storeFile(file);
        String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/")
                .path(fileName)
                .toUriString();

        PostResponse updatedPost = postService.attachImageToPost(postId, fileUrl, author);
        return ResponseEntity.ok(updatedPost);
    }
}
