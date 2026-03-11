package com.amalitech.qa.comments;

import java.util.Map;

public final class CommentPayload {

    private CommentPayload() {}

    public static Map<String, String> create(String body) {
        return Map.of("body", body);
    }
}