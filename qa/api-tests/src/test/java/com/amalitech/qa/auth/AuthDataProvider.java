package com.amalitech.qa.auth;

import com.amalitech.qa.base.BaseTest;
import org.junit.jupiter.params.provider.Arguments;

import java.util.stream.Stream;

public final class AuthDataProvider extends BaseTest {

    private AuthDataProvider() {}

    public static Stream<Arguments> invalidRegistrationInputs() {
        return loadTestData("testdata/auth/invalid_registration.json")
                .stream()
                .map(row -> Arguments.of(
                        row.get("label"),
                        row.get("fullName"),
                        row.get("email"),
                        row.get("password")
                ));
    }

    public static Stream<Arguments> invalidLoginCredentials() {
        return loadTestData("testdata/auth/invalid_login.json")
                .stream()
                .map(row -> Arguments.of(
                        row.get("label"),
                        row.get("email"),
                        row.get("password")
                ));
    }
}