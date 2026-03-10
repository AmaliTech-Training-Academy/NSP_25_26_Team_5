package com.amalitech.communityboard.service;

import com.amalitech.communityboard.dto.CategoryRequest;
import com.amalitech.communityboard.exception.ResourceNotFoundException;
import com.amalitech.communityboard.model.Category;
import com.amalitech.communityboard.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private static final Logger log = LoggerFactory.getLogger(CategoryService.class);

    private final CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    public Category createCategory(CategoryRequest request) {
        // Enforce uniqueness
        if (categoryRepository.findByName(request.getName()).isPresent()) {
            throw new IllegalArgumentException("A category with this name already exists");
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        Category savedCategory = categoryRepository.save(category);
        log.info("New category created by an Admin: '{}'", savedCategory.getName());
        return savedCategory;
    }

    public Category updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        // If the admin is changing the name, ensure the new name isn't already used
        if (!category.getName().equalsIgnoreCase(request.getName()) &&
            categoryRepository.findByName(request.getName()).isPresent()) {
            throw new IllegalArgumentException("A category with this name already exists");
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        Category updatedCategory = categoryRepository.save(category);
        log.info("Category updated by an Admin: '{}'", updatedCategory.getName());
        return updatedCategory;
    }

    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        categoryRepository.delete(category);
        log.info("Category deleted by an Admin: '{}'", category.getName());
    }
}
