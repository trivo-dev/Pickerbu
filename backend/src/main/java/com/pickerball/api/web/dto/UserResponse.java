package com.pickerball.api.web.dto;

import com.pickerball.api.user.User;
import com.pickerball.api.user.UserType;
import java.time.Instant;
import org.springframework.lang.Nullable;

public record UserResponse(
        long id,
        String username,
        String email,
        @Nullable String firstName,
        @Nullable String lastName,
        String displayName,
        @Nullable String phone,
        @Nullable String avatarUrl,
        @Nullable String address,
        @Nullable String level,
        UserType userType,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
    public static UserResponse from(User u) {
        String dn = displayName(u.getFirstName(), u.getLastName());
        return new UserResponse(
                u.getId(),
                u.getUsername(),
                u.getEmail(),
                u.getFirstName(),
                u.getLastName(),
                dn,
                u.getPhone(),
                u.getAvatarUrl(),
                u.getAddress(),
                u.getLevel(),
                u.getUserType(),
                u.isActive(),
                u.getCreatedAt(),
                u.getUpdatedAt());
    }

    private static String displayName(@Nullable String first, @Nullable String last) {
        String f = first != null ? first.trim() : "";
        String l = last != null ? last.trim() : "";
        String combined = (f + " " + l).trim();
        return combined.isEmpty() ? "-" : combined;
    }
}
