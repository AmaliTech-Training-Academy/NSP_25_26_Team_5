package com.amalitech.communityboard.service;

import com.amalitech.communityboard.model.Post;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.CreateTopicRequest;
import software.amazon.awssdk.services.sns.model.CreateTopicResponse;
import software.amazon.awssdk.services.sns.model.PublishRequest;
import software.amazon.awssdk.services.sns.model.SnsException;

@Service
@RequiredArgsConstructor
public class SnsNotificationService {

    private static final Logger log = LoggerFactory.getLogger(SnsNotificationService.class);

    private final SnsClient snsClient;

    @Value("${aws.sns.topic-prefix:communityboard}")
    private String topicPrefix;

    /** Returns topic ARN for the given category (creates topic if it does not exist). */
    public String ensureTopicExists(Long categoryId) {
        String topicName = topicPrefix + "-category-" + categoryId;
        try {
            CreateTopicResponse response = snsClient.createTopic(CreateTopicRequest.builder().name(topicName).build());
            return response.topicArn();
        } catch (SnsException e) {
            if (e.awsErrorDetails() != null && "AlreadyExists".equals(e.awsErrorDetails().errorCode())) {
                return snsClient.listTopics().topics().stream()
                        .filter(t -> t.topicArn().endsWith(":" + topicName))
                        .findFirst()
                        .map(t -> t.topicArn())
                        .orElseThrow(() -> e);
            }
            throw e;
        }
    }

    /** Subscribe an email endpoint to the category topic. Returns SNS subscription ARN. */
    public String subscribeEmailToCategoryTopic(Long categoryId, String email) {
        String topicArn = ensureTopicExists(categoryId);
        return snsClient.subscribe(r -> r
                .topicArn(topicArn)
                .protocol("email")
                .endpoint(email)
        ).subscriptionArn();
    }

    /** Unsubscribe by ARN (e.g. when user unsubscribes from category). */
    public void unsubscribe(String subscriptionArn) {
        try {
            snsClient.unsubscribe(r -> r.subscriptionArn(subscriptionArn));
        } catch (SnsException e) {
            log.warn("SNS unsubscribe failed for {}: {}", subscriptionArn, e.getMessage());
        }
    }

    @Async
    public void notifyNewPost(Post post) {
        if (post.getCategory() == null) return;
        Long categoryId = post.getCategory().getId();
        String categoryName = post.getCategory().getName();
        String authorName = post.getAuthor() != null ? post.getAuthor().getFullName() : "Someone";
        String bodyPreview = post.getBody().length() > 100 ? post.getBody().substring(0, 100) + "..." : post.getBody();

        String subject = "New post in " + categoryName + " - CommunityBoard";
        String message = "A new post titled \"" + post.getTitle() + "\" was created by " + authorName
                + " in category \"" + categoryName + "\".\n\n"
                + "Preview: " + bodyPreview + "\n\n"
                + "Log in to CommunityBoard to read more.";

        try {
            String topicArn = ensureTopicExists(categoryId);
            snsClient.publish(PublishRequest.builder()
                    .topicArn(topicArn)
                    .subject(subject)
                    .message(message)
                    .build());
            log.info("SNS notification sent for new post in category {}", categoryName);
        } catch (SnsException e) {
            log.warn("Failed to send SNS notification for category {}: {}", categoryName, e.getMessage());
        }
    }
}
