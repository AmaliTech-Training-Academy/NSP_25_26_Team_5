package com.amalitech.qa.posts;

import java.util.Map;

public final class PostPayload {

    private PostPayload() {}

    public static Map<String, String> create(String title, String body, String category) {
        return Map.of("title", title, "body", body, "category", category);
    }
}