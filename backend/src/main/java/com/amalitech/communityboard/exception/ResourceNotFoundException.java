package com.amalitech.communityboard.exception;

// Exception thrown when a requested resource (post, comment, category, user, etc.) is not found.
public class ResourceNotFoundException extends RuntimeException {
    // Generic message
    public ResourceNotFoundException() {
        super("Resource not found: the requested item does not exist.");
    }
    // Specific message with resource details
    public ResourceNotFoundException(String resourceName, Object identifier) {
        super("Resource not found: " + resourceName + " with identifier '" + identifier + "' does not exist.");
    }
    // Fallback for custom messages
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
