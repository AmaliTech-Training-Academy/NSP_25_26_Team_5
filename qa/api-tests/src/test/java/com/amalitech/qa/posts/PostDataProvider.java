package com.amalitech.qa.posts;

import com.amalitech.qa.base.BaseTest;
import org.junit.jupiter.params.provider.Arguments;

import java.util.stream.Stream;

public final class PostDataProvider extends BaseTest {

    private PostDataProvider() {}

    public static Stream<Arguments> invalidPostCreationInputs() {
        return loadTestData("testdata/posts/invalid_post_creation.json")
                .stream()
                .map(row -> Arguments.of(
                        row.get("label"),
                        row.get("title"),
                        row.get("body"),
                        // categoryId stored as int in JSON
                        row.get("categoryId") != null ? ((Number) row.get("categoryId")).intValue() : 0
                ));
    }

    public static Stream<Arguments> searchKeywords() {
        return loadTestData("testdata/posts/search_keywords.json")
                .stream()
                .map(row -> Arguments.of(row.get("keyword")));
    }
}