package com.amalitech.communityboard.config;

import com.amalitech.communityboard.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

// JwtUtil: Utility class for generating and validating JWT tokens.
@Component
public class JwtUtil {
    // Secret key and expiration loaded from application.yml
    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration:3600000}") // default 1 hour if not set
    private long expiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    // Generate a JWT token for a given user.
    public String generateToken(User user) {
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("id", user.getId())
                .claim("role", user.getRole().name())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey()) // HMAC SHA-256 by default
                .compact();
    }

     // Extract claims from a JWT token.
    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
