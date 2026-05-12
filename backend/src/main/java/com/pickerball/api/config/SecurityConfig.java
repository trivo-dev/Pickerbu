package com.pickerball.api.config;

import com.pickerball.api.config.AppProperties.Cors;
import java.util.Arrays;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    public static final String[] PUBLIC_AUTH = {
        "/api/v1/auth/register",
        "/api/v1/auth/login",
    };

    private final Environment environment;
    private final AppProperties appProperties;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            Environment environment,
            AppProperties appProperties,
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.environment = environment;
        this.appProperties = appProperties;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsSource()))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_AUTH).permitAll()
                        .requestMatchers("/h2-console", "/h2-console/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/public/products", "/api/v1/public/products/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**")
                        .permitAll()
                        .anyRequest()
                        .authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        if (isDev()) {
            http.headers(h -> h.frameOptions(frame -> frame.disable()));
        } else {
            http.headers(h -> h.frameOptions(frame -> frame.sameOrigin()));
        }
        return http.build();
    }

    private boolean isDev() {
        return List.of(environment.getActiveProfiles()).contains("dev");
    }

    @Bean
    public CorsConfigurationSource corsSource() {
        Cors c = appProperties.getCors();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(
                Arrays.stream(c.getAllowedOrigins().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .toList()
        );
        if (config.getAllowedOrigins().isEmpty()) {
            config.setAllowedOriginPatterns(List.of("*"));
        }
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
