package com.amalitech.qa.data;

import com.amalitech.qa.config.TestConfig;
import org.junit.jupiter.params.provider.Arguments;
import java.util.stream.Stream;

public final class TestData {

    private TestData() {}

    public static final String COMMENT         = "Automated test comment.";
    public static final String COMMENT_UPDATED = "Updated automated test comment.";

    public static Stream<Arguments> invalidLogins() {
        return Stream.of(
                Arguments.of("wrong@email.com", "WrongPass!1",   "wrong email"),
                Arguments.of(TestConfig.EMAIL,  "WrongPass!999", "wrong password"),
                Arguments.of("notanemail",      "somepassword",  "bad email format"),
                Arguments.of("",               "",              "empty fields")
        );
    }

    public static Stream<Arguments> validRegistration() {
        String email = "user_" + System.currentTimeMillis() + "@test.com";
        return Stream.of(Arguments.of("Jane Doe", email, "NewPass@123!", "NewPass@123!"));
    }

    public static Stream<Arguments> invalidRegistrations() {
        return Stream.of(
                Arguments.of("",     "u@test.com",  "Pass@123!", "Pass@123!",  "empty name"),
                Arguments.of("Jane", "notanemail",  "Pass@123!", "Pass@123!",  "invalid email"),
                Arguments.of("Jane", "j@test.com",  "short",    "short",       "password too short"),
                Arguments.of("Jane", "j2@test.com", "Pass@123!", "Different1!", "password mismatch")
        );
    }

    public static Stream<Arguments> searchKeywords() {
        return Stream.of(
                Arguments.of("Community", true),
                Arguments.of("xyzabcdef", false)
        );
    }
}