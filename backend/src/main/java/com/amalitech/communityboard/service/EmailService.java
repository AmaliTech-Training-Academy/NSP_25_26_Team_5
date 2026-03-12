package com.amalitech.communityboard.service;

import com.amalitech.communityboard.model.Category;
import com.amalitech.communityboard.model.CategorySubscription;
import com.amalitech.communityboard.model.Post;
import com.amalitech.communityboard.model.User;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender javaMailSender;

    @Value("${app.base-url:}")
    private String appBaseUrl;

    private static final String FROM = "noreply@communityboard.local";

    /** Send our confirmation email when user subscribes to a category (replaces AWS SNS default message). */
    @Async
    public void sendSubscriptionConfirmation(User user, Category category, String confirmLink) {
        String subject = "Confirm your subscription to \"" + category.getName() + "\" – CommunityBoard";
        String body = "Hello " + user.getFullName() + ",\n\n"
                + "You asked to receive email when new posts are added to the category \""
                + category.getName() + "\" on CommunityBoard.\n\n"
                + "To confirm and start receiving notifications, click this link:\n\n"
                + confirmLink + "\n\n"
                + "This link expires in 24 hours. If you didn't request this, you can ignore this email.\n\n"
                + "— CommunityBoard";
        send(user.getEmail(), subject, body);
    }

    /** Send new-post notification to confirmed category subscribers (our message, not SNS). */
    @Async
    public void sendNewPostNotificationToSubscribers(Post post, List<CategorySubscription> subscribers) {
        if (subscribers.isEmpty()) return;
        String categoryName = post.getCategory().getName();
        String authorName = post.getAuthor() != null ? post.getAuthor().getFullName() : "Someone";
        String bodyPreview = post.getBody().length() > 200
                ? post.getBody().substring(0, 200).trim() + "..."
                : post.getBody().trim();
        bodyPreview = bodyPreview.replace("\r\n", " ").replace("\n", " ");

        String subject = "New post in " + categoryName + ": " + post.getTitle();
        String messageBody = buildNewPostEmailBody(categoryName, post.getTitle(), authorName, bodyPreview, post.getId());

        for (CategorySubscription sub : subscribers) {
            try {
                send(sub.getUser().getEmail(), subject, messageBody);
            } catch (Exception e) {
                log.warn("Failed to send new-post email to {}: {}", sub.getUser().getEmail(), e.getMessage());
            }
        }
    }

    private String buildNewPostEmailBody(String categoryName, String title, String authorName, String bodyPreview, Long postId) {
        StringBuilder sb = new StringBuilder();
        sb.append("You're receiving this because you subscribed to category \"").append(categoryName).append("\" on CommunityBoard.\n\n");
        sb.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        sb.append("NEW POST\n");
        sb.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n");
        sb.append("Title: ").append(title).append("\n");
        sb.append("Author: ").append(authorName).append("\n");
        sb.append("Category: ").append(categoryName).append("\n\n");
        sb.append("Preview:\n").append(bodyPreview).append("\n\n");
        if (appBaseUrl != null && !appBaseUrl.isBlank()) {
            sb.append("View full post: ").append(appBaseUrl.replaceAll("/$", "")).append("/posts/").append(postId).append("\n\n");
        }
        sb.append("— CommunityBoard");
        return sb.toString();
    }

    private void send(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            message.setFrom(FROM);
            javaMailSender.send(message);
            log.info("Sent email to {}: {}", to, subject);
        } catch (Exception e) {
            log.warn("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
