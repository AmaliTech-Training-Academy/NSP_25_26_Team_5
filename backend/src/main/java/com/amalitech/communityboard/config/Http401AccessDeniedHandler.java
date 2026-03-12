package com.amalitech.communityboard.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.access.AccessDeniedHandler;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Returns 401 with JSON body when the user is not authenticated (anonymous).
 * Returns 403 when authenticated but not authorized.
 * Avoids empty 403 responses for missing/invalid JWT.
 */
public class Http401AccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       org.springframework.security.access.AccessDeniedException accessDeniedException) throws IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAnonymous = auth == null || auth.getPrincipal() == null
                || "anonymousUser".equals(auth.getPrincipal());

        if (isAnonymous) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(objectMapper.writeValueAsString(Map.of(
                    "status", 401,
                    "message", "Authentication required. Please log in.",
                    "timestamp", LocalDateTime.now().toString()
            )));
        } else {
            response.setStatus(HttpStatus.FORBIDDEN.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(objectMapper.writeValueAsString(Map.of(
                    "status", 403,
                    "message", "Access denied.",
                    "timestamp", LocalDateTime.now().toString()
            )));
        }
    }
}
