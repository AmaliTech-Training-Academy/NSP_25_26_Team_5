package com.amalitech.communityboard.service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")   //  loads application-test.yml
public class PostServiceTest {

    @Test
    void sampleTest() {
        System.out.println("Running PostService test with test profile...");
    }
}
