package com.amalitech.communityboard.exception;

// Thrown when a user tries to register with an email that already exists in the system.
public class DuplicateEmailException extends RuntimeException {

    public DuplicateEmailException(String email) {
        super("Registration failed: email '" + email + "' is already in use. Please log in instead.");
    }
}
