package com.amalitech.qa.config;

public final class ApiEndpoints {

    private ApiEndpoints() {}

    public static final String BASE_URL = "http://localhost:8080";

    // Auth
    public static final String REGISTER = "/api/auth/register";
    public static final String LOGIN     = "/api/auth/login";

    // Posts
    public static final String POSTS        = "/api/posts";
    public static final String POST_BY_ID   = "/api/posts/{id}";
    public static final String POSTS_SEARCH = "/api/posts/search";

    // Comments nested under posts
    public static final String COMMENTS      = "/api/posts/{postId}/comments";
    public static final String COMMENT_BY_ID = "/api/posts/{postId}/comments/{commentId}";

    // Admin only
    public static final String ADMIN_USERS      = "/api/admin/users";
    public static final String ADMIN_USER_BY_ID = "/api/admin/users/{id}";

    // Analytics
    public static final String ANALYTICS = "/api/analytics";

    // Current user
    public static final String MY_PROFILE = "/api/users/me";
}