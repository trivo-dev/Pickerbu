package com.pickerball.api.security;

import com.pickerball.api.config.AppProperties;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.io.DecodingException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.MacAlgorithm;
import io.jsonwebtoken.security.SecurityException;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import javax.crypto.SecretKey;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private static final String CLAIM_EMAIL = "email";
    private static final MacAlgorithm SIGNATURE = Jwts.SIG.HS256;

    private final AppProperties appProperties;
    private final SecretKey secretKey;

    public JwtService(AppProperties appProperties) {
        this.appProperties = appProperties;
        byte[] key = decodeKey(appProperties.getJwt().getSecret());
        this.secretKey = Keys.hmacShaKeyFor(key);
    }

    public String generateToken(@NonNull SecurityUser user) {
        Instant now = Instant.now();
        long exp = appProperties.getJwt().getAccessTokenExpirationMs();
        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .claim(CLAIM_EMAIL, user.getUsername())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(exp)))
                .signWith(secretKey, SIGNATURE)
                .compact();
    }

    public Optional<Long> parseUserIdFromToken(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        try {
            String sub = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
            return Optional.of(Long.parseLong(sub));
        } catch (ExpiredJwtException
                | MalformedJwtException
                | DecodingException
                | SecurityException
                | NumberFormatException e) {
            return Optional.empty();
        }
    }

    private static byte[] decodeKey(String secret) {
        try {
            return Decoders.BASE64.decode(secret);
        } catch (DecodingException e) {
            return secret.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        }
    }
}
