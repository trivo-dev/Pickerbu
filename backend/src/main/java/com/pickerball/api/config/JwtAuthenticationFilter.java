package com.pickerball.api.config;

import com.pickerball.api.security.JwtService;
import com.pickerball.api.security.SecurityUser;
import com.pickerball.api.security.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    public static final String AUTH_HEADER = "Authorization";
    public static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsServiceImpl userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }
        String header = request.getHeader(AUTH_HEADER);
        if (!StringUtils.hasText(header) || !header.startsWith(BEARER_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }
        String token = header.substring(BEARER_PREFIX.length()).trim();
        jwtService
                .parseUserIdFromToken(token)
                .ifPresentOrElse(
                        id -> {
                            try {
                                SecurityUser user = userDetailsService.loadById(id);
                                var auth = new UsernamePasswordAuthenticationToken(
                                        user, null, user.getAuthorities()
                                );
                                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                                SecurityContextHolder.getContext().setAuthentication(auth);
                            } catch (Exception ignored) {
                                // Invalid user id in token: leave unauthenticated
                            }
                        },
                        () -> { /* no-op */ }
                );
        filterChain.doFilter(request, response);
    }
}
