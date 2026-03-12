package com.amalitech.qa.config;

public final class TestConfig {

    private TestConfig() {}

    public static final String BASE_URL  = "http://community-dev-alb-132495914.eu-north-1.elb.amazonaws.com";
    public static final String LOGIN     = "/login";
    public static final String REGISTER  = "/register";
    public static final String ANALYTICS = "/analytics";

    // Test user credentials
    public static final String EMAIL    = "testuser@amalitech.com";
    public static final String PASSWORD = "Test@1234!";

    // Admin credentials
    public static final String ADMIN_EMAIL    = "admin@amalitech.com";
    public static final String ADMIN_PASSWORD = "password123";

    public static final long WAIT = 10;

    // Filter pills on home page (from Figma)
    public static final String FILTER_ALL        = "All";
    public static final String FILTER_NEWS       = "News";
    public static final String FILTER_EVENT      = "Event";
    public static final String FILTER_DISCUSSION = "Discussion";
    public static final String FILTER_ALERT      = "Alert";

    // Category options in create/edit post dropdown (from Figma badge)
    public static final String CAT_EVENTS = "Events";
    public static final String CAT_NEWS   = "News";
}