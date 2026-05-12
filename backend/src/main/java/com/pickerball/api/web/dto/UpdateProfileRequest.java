package com.pickerball.api.web.dto;

import jakarta.validation.constraints.Size;
import org.springframework.lang.Nullable;

public class UpdateProfileRequest {

    @Nullable
    @Size(max = 100)
    private String firstName;

    @Nullable
    @Size(max = 100)
    private String lastName;

    @Nullable
    @Size(max = 32)
    @jakarta.validation.constraints.Pattern(
            regexp = "^(|[0-9+\\-\\s()]+)$",
            message = "Invalid phone")
    private String phone;

    @Nullable
    @Size(max = 255)
    private String avatarUrl;

    @Nullable
    @Size(max = 255)
    private String address;

    /** Beginner, Intermediate, Advanced, Pro */
    @Nullable
    @Size(max = 50)
    private String level;

    @Nullable
    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(@Nullable String firstName) {
        this.firstName = firstName;
    }

    @Nullable
    public String getLastName() {
        return lastName;
    }

    public void setLastName(@Nullable String lastName) {
        this.lastName = lastName;
    }

    @Nullable
    public String getPhone() {
        return phone;
    }

    public void setPhone(@Nullable String phone) {
        this.phone = phone;
    }

    @Nullable
    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(@Nullable String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    @Nullable
    public String getAddress() {
        return address;
    }

    public void setAddress(@Nullable String address) {
        this.address = address;
    }

    @Nullable
    public String getLevel() {
        return level;
    }

    public void setLevel(@Nullable String level) {
        this.level = level;
    }
}
