package com.amalitech.qa.models;

import com.fasterxml.jackson.annotation.JsonInclude;

public final class Requests {

    private Requests() {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class RegisterRequest {
        public String fullName;
        public String email;
        public String password;

        public RegisterRequest(String fullName, String email, String password) {
            this.fullName = fullName;
            this.email    = email;
            this.password = password;
        }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class LoginRequest {
        public String email;
        public String password;

        public LoginRequest(String email, String password) {
            this.email    = email;
            this.password = password;
        }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PostRequest {
        public String title;
        public String body;
        public String category;

        public PostRequest(String title, String body, String category) {
            this.title    = title;
            this.body     = body;
            this.category = category;
        }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CommentRequest {
        public String body;

        public CommentRequest(String body) {
            this.body = body;
        }
    }
}