package com.amalitech.communityboard.exception;

//If the email and password does not exist, the system returns an error: Invalid email or password
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("Invalid email or password");
    }
}
