package com.amalitech.communityboard.config;

import com.amalitech.communityboard.repository.UserRepository;
import com.amalitech.communityboard.model.User;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    private final JwtUtil jwtUtil;              // unified JwtUtil
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Step 1: Get the Authorization header
        String authHeader = request.getHeader("Authorization");

        // Step 2: If no Bearer token, skip
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Step 3: Extract token
        String token = authHeader.substring(7);

        try {
            // Step 4: Parse claims
            Claims claims = jwtUtil.extractClaims(token);
            String email = claims.getSubject();

            // Step 5: Look up user
            userRepository.findByEmail(email).ifPresent(user -> {
                // Step 6: Validate token against user
                if (jwtUtil.isTokenValid(token, user)) {
                    var auth = new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
                    );

                    // Step 7: Set authentication in context
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    log.debug("Authenticated user: {} with role: {}", email, user.getRole());
                } else {
                    log.warn("Invalid or expired JWT for user {}", email);
                }
            });

        } catch (Exception e) {
            log.warn("Invalid JWT token for request {}: {}", request.getRequestURI(), e.getMessage());
        }

        // Step 8: Continue filter chain
        filterChain.doFilter(request, response);
    }
}
