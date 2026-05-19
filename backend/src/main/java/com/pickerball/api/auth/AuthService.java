package com.pickerball.api.auth;

import com.pickerball.api.config.AppProperties;
import com.pickerball.api.security.JwtService;
import com.pickerball.api.security.SecurityUser;
import com.pickerball.api.user.User;
import com.pickerball.api.user.UserRepository;
import com.pickerball.api.user.UserRoleSync;
import com.pickerball.api.user.UserType;
import com.pickerball.api.web.dto.AuthResponse;
import com.pickerball.api.web.dto.LoginRequest;
import com.pickerball.api.web.dto.RegisterRequest;
import com.pickerball.api.web.dto.UserResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AppProperties appProperties;
    private final UserRoleSync userRoleSync;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AppProperties appProperties,
            UserRoleSync userRoleSync
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.appProperties = appProperties;
        this.userRoleSync = userRoleSync;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        String username = req.getUsername().trim();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already in use");
        }
        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already in use");
        }
        String phone = normalizePhone(req.getPhone());
        if (StringUtils.hasText(phone) && userRepository.existsByPhone(phone)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone is already in use");
        }
        User u = new User();
        u.setUsername(username);
        u.setEmail(email);
        u.setPhone(phone);
        u.setPassword(passwordEncoder.encode(req.getPassword()));
        u.setFirstName(req.getFirstName().trim());
        u.setLastName(req.getLastName() != null ? req.getLastName().trim() : null);
        u.setUserType(UserType.PLAYER);
        u.setActive(true);
        userRoleSync.syncRolesFromUserType(u);
        u = userRepository.save(u);
        SecurityUser su = SecurityUser.from(u);
        String token = jwtService.generateToken(su);
        long exp = appProperties.getJwt().getAccessTokenExpirationMs();
        return AuthResponse.of(token, exp, UserResponse.from(u));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        User u = userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(
                        () -> new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Invalid email or password"
                        )
                );
        if (!u.isActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is disabled");
        }
        if (!passwordEncoder.matches(req.getPassword(), u.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        SecurityUser su = SecurityUser.from(u);
        String token = jwtService.generateToken(su);
        long exp = appProperties.getJwt().getAccessTokenExpirationMs();
        return AuthResponse.of(token, exp, UserResponse.from(u));
    }

    private static String normalizePhone(String phone) {
        if (phone == null) {
            return null;
        }
        String t = phone.trim();
        return t.isEmpty() ? null : t;
    }
}
