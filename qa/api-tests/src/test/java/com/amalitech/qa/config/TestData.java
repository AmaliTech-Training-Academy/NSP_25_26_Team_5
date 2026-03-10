package com.amalitech.qa.config;

public final class TestData {

    private TestData() {}

    // Seeded users from DevOps docs
    public static final String ADMIN_EMAIL    = "admin@amalitech.com";
    public static final String ADMIN_PASSWORD = "password123";
    public static final String USER_EMAIL     = "user@amalitech.com";
    public static final String USER_PASSWORD  = "password123";

    // Valid registration values
    public static final String VALID_FULL_NAME = "Jane Resident";
    public static final String VALID_PASSWORD  = "Secure@123";

    // Post categories
    public static final String CATEGORY_EVENTS          = "Events";
    public static final String CATEGORY_LOST_AND_FOUND  = "Lost & Found";
    public static final String CATEGORY_RECOMMENDATIONS = "Recommendations";
    public static final String CATEGORY_HELP_REQUESTS   = "Help Requests";

    // Auth response fields confirmed from Swagger
    public static final String FIELD_TOKEN     = "token";
    public static final String FIELD_EMAIL     = "email";
    public static final String FIELD_FULL_NAME = "fullName";
    public static final String FIELD_ROLE      = "role";
    public static final String FIELD_MESSAGE   = "message";

    // Post response fields confirmed from Swagger
    public static final String FIELD_POST_ID            = "id";
    public static final String FIELD_POST_TITLE         = "title";
    public static final String FIELD_POST_BODY          = "body";
    public static final String FIELD_POST_CATEGORY_NAME = "categoryName";
    public static final String FIELD_POST_AUTHOR_NAME   = "authorName";
    public static final String FIELD_POST_CREATED_AT    = "createdAt";
    public static final String FIELD_POST_UPDATED_AT    = "updatedAt";

    // Comment response fields confirmed from Swagger
    public static final String FIELD_COMMENT_ID          = "id";
    public static final String FIELD_COMMENT_BODY        = "body";
    public static final String FIELD_COMMENT_AUTHOR_NAME = "authorName";
    public static final String FIELD_COMMENT_CREATED_AT  = "createdAt";

    // Spring Page response fields
    public static final String FIELD_PAGE_CONTENT       = "content";
    public static final String FIELD_PAGE_TOTAL_ELEMENTS = "totalElements";
}