package com.amalitech.qa.auth;

import java.util.Map;

public final class AuthPayload {

    private AuthPayload() {}

    public static Map<String, String> register(String fullName, String email, String password) {
        return Map.of("fullName", fullName, "email", email, "password", password);
    }

    public static Map<String, String> login(String email, String password) {
        return Map.of("email", email, "password", password);
    }
}