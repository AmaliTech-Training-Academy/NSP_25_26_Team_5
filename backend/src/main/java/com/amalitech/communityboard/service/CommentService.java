package com.amalitech.communityboard.service;

import com.amalitech.communityboard.dto.CommentRequest;
import com.amalitech.communityboard.dto.CommentResponse;
import com.amalitech.communityboard.exception.ResourceNotFoundException;
import com.amalitech.communityboard.exception.UnauthorizedException;
import com.amalitech.communityboard.model.Comment;
import com.amalitech.communityboard.model.Post;
import com.amalitech.communityboard.model.User;
import com.amalitech.communityboard.model.enums.Role;
import com.amalitech.communityboard.repository.CommentRepository;
import com.amalitech.communityboard.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private static final Logger log = LoggerFactory.getLogger(CommentService.class);

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    // Get all comments for a specific post.
    public List<CommentResponse> getCommentsByPost(Long postId) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post not found with id: " + postId);
        }

        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId).stream()
                .map(this::toResponse).toList();
    }

    // Get a specific comment by ID.
    public CommentResponse getCommentById(Long postId, Long commentId) {
        Comment comment = commentRepository.findByIdAndPostId(commentId, postId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Comment not found with id: " + commentId + " for post: " + postId));
        return toResponse(comment);
    }


    // Create a new comment on a post.
    public CommentResponse createComment(Long postId, CommentRequest request, User author) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        Comment comment = Comment.builder()
                .body(request.getBody())
                .post(post)
                .author(author)
                .build();

        Comment savedComment = commentRepository.save(comment);
        log.info("Comment created on post {} by {}", postId, author.getEmail());

        post.setUpdatedAt(java.time.LocalDateTime.now());
        postRepository.save(post);

        return toResponse(savedComment);
    }

    // Update an existing comment.
    public CommentResponse updateComment(Long commentId, CommentRequest request, User author) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        if (!comment.getAuthor().getId().equals(author.getId())) {
            log.warn("Unauthorized attempt to edit comment {} by user {}", commentId, author.getEmail());
            throw new UnauthorizedException("You are not authorized to edit this comment");
        }

        comment.setBody(request.getBody());
        Comment savedComment = commentRepository.save(comment);

        log.info("Comment {} updated by user {}", commentId, author.getEmail());
        return toResponse(savedComment);
    }

    // Delete a comment (author or admin only).
    public void deleteComment(Long commentId, User author) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        boolean isAuthor = comment.getAuthor().getId().equals(author.getId());
        boolean isAdmin = author.getRole() == Role.ADMIN;

        if (!isAuthor && !isAdmin) {
            log.warn("Unauthorized attempt to delete comment {} by user {}", commentId, author.getEmail());
            throw new UnauthorizedException("You are not authorized to delete this comment");
        }

        commentRepository.delete(comment);
        log.info("Comment {} deleted by user {}", commentId, author.getEmail());
    }

    // Convert entity to DTO
    private CommentResponse toResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .body(comment.getBody())
                .authorName(comment.getAuthor().getFullName())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
