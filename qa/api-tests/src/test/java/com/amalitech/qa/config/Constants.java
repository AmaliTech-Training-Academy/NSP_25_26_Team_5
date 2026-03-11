package com.amalitech.qa.config;

public final class Constants {

    private Constants() {}

    // Base URL — overridable via env var for CI
    public static final String BASE_URL = System.getenv().getOrDefault("BASE_URL", "http://localhost:8080");

    // Auth endpoints
    public static final String REGISTER = "/api/auth/register";
    public static final String LOGIN     = "/api/auth/login";

    // Post endpoints
    public static final String POSTS        = "/api/posts";
    public static final String POST_BY_ID   = "/api/posts/{id}";
    public static final String POSTS_SEARCH = "/api/posts/search";

    // Comment endpoints
    public static final String COMMENTS      = "/api/posts/{postId}/comments";
    public static final String COMMENT_BY_ID = "/api/posts/{postId}/comments/{commentId}";

    // Admin endpoints
    public static final String ADMIN_USERS      = "/api/admin/users";
    public static final String ADMIN_USER_BY_ID = "/api/admin/users/{id}";
    public static final String ADMIN_USER_ROLE  = "/api/admin/users/{id}/role";

    // User endpoints
    public static final String USERS_ME = "/api/users/me";

    // Analytics endpoint
    public static final String ANALYTICS_DASHBOARD = "/api/analytics/dashboard";

    // Seeded credentials — must match data.sql
    public static final String ADMIN_EMAIL    = "admin@amalitech.com";
    public static final String ADMIN_PASSWORD = "password123";

    // Category IDs — must match data.sql seed (News=1, Event=2, Discussion=3, Alert=4)
    public static final int CATEGORY_NEWS       = 1;
    public static final int CATEGORY_EVENT      = 2;
    public static final int CATEGORY_DISCUSSION = 3;
    public static final int CATEGORY_ALERT      = 4;

    // Auth response fields
    public static final String FIELD_TOKEN     = "token";
    public static final String FIELD_EMAIL     = "email";
    public static final String FIELD_FULL_NAME = "fullName";
    public static final String FIELD_ROLE      = "role";
    public static final String FIELD_MESSAGE   = "message";

    // Post response fields
    public static final String FIELD_POST_ID            = "id";
    public static final String FIELD_POST_TITLE         = "title";
    public static final String FIELD_POST_CATEGORY_NAME = "categoryName";
    public static final String FIELD_POST_AUTHOR_NAME   = "authorName";
    public static final String FIELD_POST_CREATED_AT    = "createdAt";
    public static final String FIELD_POST_UPDATED_AT    = "updatedAt";

    // Comment response fields
    public static final String FIELD_COMMENT_ID          = "id";
    public static final String FIELD_COMMENT_BODY        = "body";
    public static final String FIELD_COMMENT_AUTHOR_NAME = "authorName";
    public static final String FIELD_COMMENT_CREATED_AT  = "createdAt";

    // Pagination fields
    public static final String FIELD_PAGE_CONTENT = "content";
}