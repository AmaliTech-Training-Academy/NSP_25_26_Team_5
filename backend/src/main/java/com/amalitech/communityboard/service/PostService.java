package com.amalitech.communityboard.service;

import com.amalitech.communityboard.dto.*;
import com.amalitech.communityboard.exception.ResourceNotFoundException;
import com.amalitech.communityboard.exception.UnauthorizedException;
import com.amalitech.communityboard.model.*;
import com.amalitech.communityboard.model.enums.Role;
import com.amalitech.communityboard.repository.CategoryRepository;
import com.amalitech.communityboard.repository.CommentRepository;
import com.amalitech.communityboard.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private static final Logger log = LoggerFactory.getLogger(PostService.class);

    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;
    private final CommentRepository commentRepository;
    private final EmailService emailService;

    public Page<PostResponse> getAllPosts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return postRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::toResponse);
    }

    public PostResponse getPostById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));
        PostResponse response = toResponse(post);
        List<CommentResponse> comments = commentRepository.findByPostIdOrderByCreatedAtAsc(id).stream()
                .map(this::toCommentResponse).toList();
        response.setComments(comments);

        return response;
    }

    private CommentResponse toCommentResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .body(comment.getBody())
                .authorName(comment.getAuthor().getFullName())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    public PostResponse createPost(PostRequest request, User author) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
        Post post = Post.builder()
                .title(request.getTitle())
                .body(request.getBody())
                .category(category)
                .author(author)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Post savedPost = postRepository.save(post);
        log.info("Post created: '{}' by {}", savedPost.getTitle(), author.getEmail());

        // Send email notifications to users subscribed to this category
        emailService.sendNewPostNotification(savedPost);

        return toResponse(savedPost);
    }

    public PostResponse updatePost(Long id, PostRequest request, User author) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        // Only the original author can edit the post
        if (!post.getAuthor().getId().equals(author.getId())) {
            throw new UnauthorizedException("You are not authorized to update this post");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
        post.setTitle(request.getTitle());
        post.setBody(request.getBody());
        post.setCategory(category);
        post.setUpdatedAt(LocalDateTime.now());

        Post savedPost = postRepository.save(post);
        log.info("Post updated: '{}' by {}", savedPost.getTitle(), author.getEmail());
        return toResponse(savedPost);
    }

    public void deletePost(Long id, User author) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        // Check authorization: must be the author OR an admin
        boolean isAuthor = post.getAuthor().getId().equals(author.getId());
        boolean isAdmin = author.getRole() == Role.ADMIN;

        if (!isAuthor && !isAdmin) {
            throw new UnauthorizedException("You are not authorized to delete this post");
        }

        postRepository.delete(post);
        log.info("Post deleted: '{}' by {}", post.getTitle(), author.getEmail());
    }

    // Search and Filter posts by multiple combined criteria.
    public Page<PostResponse> searchPosts(String keyword, String category, LocalDateTime startDate, LocalDateTime endDate, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<Post> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Search by keyword (title OR body case-insensitive)
            if (keyword != null && !keyword.trim().isEmpty()) {
                String pattern = "%" + keyword.toLowerCase() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), pattern);
                Predicate bodyMatch = cb.like(cb.lower(root.get("body")), pattern);
                predicates.add(cb.or(titleMatch, bodyMatch));
            }

            // Filter by category (by category name)
            if (category != null && !category.trim().isEmpty()) {
                predicates.add(cb.equal(root.join("category", JoinType.LEFT).get("name"), category.trim()));
            }

            // Filter by Date Range (start to end)
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startDate));
            }

            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return postRepository.findAll(spec, pageable).map(this::toResponse);
    }

    // This is what the frontend receives — contains all the display data
    private PostResponse toResponse(Post post) {
        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .body(post.getBody())
                .categoryName(post.getCategory() != null ? post.getCategory().getName() : null)
                .authorName(post.getAuthor().getFullName())
                .authorEmail(post.getAuthor().getEmail())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .commentCount(commentRepository.countByPostId(post.getId()))
                .build();
    }
}
