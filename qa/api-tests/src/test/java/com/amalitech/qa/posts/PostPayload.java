package com.amalitech.qa.posts;

import java.util.Map;

public final class PostPayload {

    private PostPayload() {}

    // categoryId must be the integer ID from the categories table
    public static Map<String, Object> create(String title, String body, int categoryId) {
        return Map.of("title", title, "body", body, "categoryId", categoryId);
    }
}