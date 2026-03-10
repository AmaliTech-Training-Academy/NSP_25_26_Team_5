package com.amalitech.communityboard.service;

import com.amalitech.communityboard.model.Post;
import com.amalitech.communityboard.model.User;
import com.amalitech.communityboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

// Service to handle dispatching email notifications.
@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final UserRepository userRepository;
    private final JavaMailSender javaMailSender;

    // Send email notifications to all users when a new post is created in a category
    @Async
    public void sendNewPostNotification(Post post) {
        if (post.getCategory() == null || post.getCategory().isBlank()) {
            return; // No category, nothing to notify
        }

        // For Option B schema: no subscribedCategories relationship.
        // Instead, you might notify ALL users, or later filter by preferences if you add them.
        List<User> subscribers = userRepository.findAll();
        if (subscribers.isEmpty()) {
            return;
        }

        String subject = "New Post in " + post.getCategory() + " - CommunityBoard";
        String body = "Hello!\n\n"
                + "A new post titled '" + post.getTitle() + "' has just been created by "
                + post.getAuthor().getFullName() + " in category '" + post.getCategory() + "'.\n\n"
                + "Post content summary:\n"
                + (post.getBody().length() > 50 ? post.getBody().substring(0, 50) + "..." : post.getBody()) + "\n\n"
                + "Log in to the CommunityBoard to view more details!\n\nBest,\nYour Delivery Team.";

        for (User user : subscribers) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(user.getEmail());
                message.setSubject(subject);
                message.setText(body);
                message.setFrom("noreply@communityboard.local");

                javaMailSender.send(message);
                log.info("Successfully sent notification email to {}", user.getEmail());
            } catch (Exception e) {
                log.warn("Failed to send email to {}: {}", user.getEmail(), e.getMessage());
            }
        }
    }
}
