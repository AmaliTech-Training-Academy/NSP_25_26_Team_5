package com.amalitech.communityboard.config;

import com.amalitech.communityboard.repository.UserRepository;
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

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Step 1: Get the Authorization header from the request
        String authHeader = request.getHeader("Authorization");

        // Step 2: If no Bearer token is present, skip JWT authentication The request will proceed to the security filter chain, which will decide whether the endpoint is publicly accessible or requires authentication
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        // Step 3: Extract the token (remove the "Bearer " prefix)
        String token = authHeader.substring(7);

        // Step 4: Validate the token — checks signature, expiration, and format
        if (jwtService.isTokenValid(token)) {
            // Step 5: Extract the email from the token and look up the user
            String email = jwtService.extractEmail(token);
            userRepository.findByEmail(email).ifPresent(user -> {

                // Step 6: Create an authentication object with the user's role The "ROLE_" prefix is required by Spring Security's role-based access control e.g., the enum Role.ADMIN becomes authority "ROLE_ADMIN"
                var auth = new UsernamePasswordAuthenticationToken(
                        user,   // The principal (the User object itself — accessible via @AuthenticationPrincipal)
                        null,   // Credentials (not needed after authentication)
                        List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
                );

                // Step 7: Set the authenticated user in Spring Security's context ,After this, the user is "logged in" for this request
                SecurityContextHolder.getContext().setAuthentication(auth);
                log.debug("Authenticated user: {} with role: {}", email, user.getRole());
            });
        } else {
            log.warn("Invalid JWT token received for request: {}", request.getRequestURI());
        }

        // Step 8: Continue the filter chain — the request proceeds to the controller
        filterChain.doFilter(request, response);
    }
}
