package com.pickerball.api.user;

import com.pickerball.api.web.dto.UpdateProfileRequest;
import com.pickerball.api.web.dto.UserResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AccountService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AccountService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public UserResponse getProfile(long userId) {
        User u = findUser(userId);
        return UserResponse.from(u);
    }

    @Transactional
    public UserResponse updateProfile(long userId, UpdateProfileRequest req) {
        User u = findUser(userId);
        if (StringUtils.hasText(req.getFirstName())) {
            u.setFirstName(req.getFirstName().trim());
        }
        if (req.getLastName() != null) {
            u.setLastName(StringUtils.hasText(req.getLastName()) ? req.getLastName().trim() : null);
        }
        if (req.getPhone() != null) {
            String phone = normalizePhone(req.getPhone());
            if (StringUtils.hasText(phone) && !phone.equals(u.getPhone())) {
                if (userRepository.existsOtherWithPhone(phone, u.getId())) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone is already in use");
                }
            }
            u.setPhone(phone);
        }
        if (StringUtils.hasText(req.getAvatarUrl())) {
            u.setAvatarUrl(req.getAvatarUrl().trim());
        } else if (req.getAvatarUrl() != null && req.getAvatarUrl().isEmpty()) {
            u.setAvatarUrl(null);
        }
        if (req.getAddress() != null) {
            u.setAddress(StringUtils.hasText(req.getAddress()) ? req.getAddress().trim() : null);
        }
        if (req.getLevel() != null) {
            u.setLevel(StringUtils.hasText(req.getLevel()) ? req.getLevel().trim() : null);
        }
        return UserResponse.from(u);
    }

    @Transactional
    public void changePassword(long userId, String currentPassword, String newPassword) {
        User u = findUser(userId);
        if (!passwordEncoder.matches(currentPassword, u.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Current password is wrong");
        }
        u.setPassword(passwordEncoder.encode(newPassword));
    }

    private User findUser(long id) {
        return userRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private static String normalizePhone(String phone) {
        if (phone == null) {
            return null;
        }
        String t = phone.trim();
        return t.isEmpty() ? null : t;
    }
}
