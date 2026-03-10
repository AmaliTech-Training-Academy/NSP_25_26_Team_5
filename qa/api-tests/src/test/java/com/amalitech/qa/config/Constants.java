package com.amalitech.qa.config;

public final class Constants {

    private Constants() {}

    public static final String BASE_URL = "http://localhost:8080";

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
    public static final String ADMIN_USERS = "/api/admin/users";

    // Analytics endpoint
    public static final String ANALYTICS = "/api/analytics";

    // Seeded credentials
    public static final String ADMIN_EMAIL    = "peace@gmail.com";
    public static final String ADMIN_PASSWORD = "password123";
//    public static final String USER_EMAIL     = "user@amalitech.com";
//    public static final String USER_PASSWORD  = "password123";

    // Categories
    public static final String CATEGORY_EVENTS          = "Events";
    public static final String CATEGORY_LOST_AND_FOUND  = "Lost & Found";
    public static final String CATEGORY_RECOMMENDATIONS = "Recommendations";
    public static final String CATEGORY_HELP_REQUESTS   = "Help Requests";

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