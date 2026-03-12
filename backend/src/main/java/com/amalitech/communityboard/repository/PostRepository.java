package com.amalitech.communityboard.repository;

import com.amalitech.communityboard.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long>, JpaSpecificationExecutor<Post> {

    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<Post> findByCategory_IdOrderByCreatedAtDesc(Long categoryId);
    List<Post> findByAuthorIdOrderByCreatedAtDesc(Long authorId);
    Page<Post> findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(String title, Pageable pageable);
}
