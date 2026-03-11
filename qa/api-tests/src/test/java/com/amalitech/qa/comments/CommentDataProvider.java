package com.amalitech.qa.comments;

import com.amalitech.qa.base.BaseTest;
import org.junit.jupiter.params.provider.Arguments;

import java.util.stream.Stream;

public final class CommentDataProvider extends BaseTest {

    private CommentDataProvider() {}

    public static Stream<Arguments> commentBoundaries() {
        return loadTestData("testdata/comments/comment_boundaries.json")
                .stream()
                .map(row -> Arguments.of(
                        row.get("label"),
                        ((Number) row.get("length")).intValue(),
                        ((Number) row.get("expectedStatus")).intValue()
                ));
    }
}