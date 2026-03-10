package com.amalitech.communityboard.repository;

import com.amalitech.communityboard.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostIdOrderByCreatedAtAsc(Long postId);
    int countByPostId(Long postId);

    // Correct: use "id" instead of "commentId"
    Optional<Comment> findByIdAndPostId(Long id, Long postId);
}
