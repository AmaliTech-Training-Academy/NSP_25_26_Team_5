package com.amalitech.communityboard.exception;

// Exception thrown when a user tries to perform  an action they are not authorized for.
public class UnauthorizedException extends RuntimeException {
    // Generic message
    public UnauthorizedException() {
        super("Access denied: you do not have permission to perform this action.");
    }
    // Specific message with action details
    public UnauthorizedException(String action) {
        super("Access denied: you are not authorized to " + action + ".");
    }
}
