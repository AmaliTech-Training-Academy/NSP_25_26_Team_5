package com.amalitech.qa.specs;

import com.amalitech.qa.config.ApiEndpoints;
import io.qameta.allure.restassured.AllureRestAssured;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.builder.ResponseSpecBuilder;
import io.restassured.http.ContentType;
import io.restassured.specification.RequestSpecification;
import io.restassured.specification.ResponseSpecification;

public final class Specs {

    private Specs() {}

    // Base request for public endpoints, no auth needed
    public static RequestSpecification guestRequest() {
        return new RequestSpecBuilder()
                .setBaseUri(ApiEndpoints.BASE_URL)
                .setContentType(ContentType.JSON)
                .addFilter(new AllureRestAssured())
                .build();
    }

    // Same as guest but with the Bearer token attached
    public static RequestSpecification authenticatedRequest(String token) {
        return new RequestSpecBuilder()
                .addRequestSpecification(guestRequest())
                .addHeader("Authorization", "Bearer " + token)
                .build();
    }

    // Use for 200 and 201 responses that return JSON
    public static ResponseSpecification successResponse(int statusCode) {
        return new ResponseSpecBuilder()
                .expectStatusCode(statusCode)
                .expectContentType(ContentType.JSON)
                .build();
    }

    // Use for error responses, content type not enforced
    public static ResponseSpecification errorResponse(int statusCode) {
        return new ResponseSpecBuilder()
                .expectStatusCode(statusCode)
                .build();
    }
}