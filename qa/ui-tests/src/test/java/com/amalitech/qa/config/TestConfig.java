package com.amalitech.qa.config;

public final class TestConfig {

    private TestConfig() {}

    public static final String BASE_URL  = "http://community-dev-alb-1677940239.eu-north-1.elb.amazonaws.com";
    public static final String LOGIN     = "/login";
    public static final String REGISTER  = "/register";
    public static final String ANALYTICS = "/analytics";

    // Admin account — used as the default test user
    public static final String ADMIN_EMAIL    = "admin@amalitech.com";
    public static final String ADMIN_PASSWORD = "password123";

    public static final long WAIT = 15;

    // Filter pills on home page
    public static final String FILTER_ALL        = "All";
    public static final String FILTER_NEWS       = "News";
    public static final String FILTER_EVENT      = "Event";
    public static final String FILTER_DISCUSSION = "Discussion";
    public static final String FILTER_ALERT      = "Alert";

    // Category options in the create/edit post dropdown
    public static final String CAT_EVENTS = "Events";
    public static final String CAT_NEWS   = "News";
}