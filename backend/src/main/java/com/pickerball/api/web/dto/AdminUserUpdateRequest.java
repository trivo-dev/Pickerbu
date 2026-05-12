package com.pickerball.api.web.dto;

import com.pickerball.api.user.UserType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import org.springframework.lang.Nullable;

public class AdminUserUpdateRequest {

    @Nullable
    @Email
    @Size(max = 150)
    private String email;

    @Nullable
    @Size(max = 100)
    private String username;

    @Nullable
    @Size(max = 100)
    private String firstName;

    @Nullable
    @Size(max = 100)
    private String lastName;

    @Nullable
    @Size(max = 32)
    private String phone;

    @Nullable
    @Size(max = 255)
    private String avatarUrl;

    @Nullable
    @Size(max = 255)
    private String address;

    @Nullable
    @Size(max = 50)
    private String level;

    @Nullable
    private UserType userType;

    @Nullable
    private Boolean active;

    @Nullable
    @Size(min = 8, max = 255)
    private String newPassword;

    @Nullable
    public String getEmail() {
        return email;
    }

    public void setEmail(@Nullable String email) {
        this.email = email;
    }

    @Nullable
    public String getUsername() {
        return username;
    }

    public void setUsername(@Nullable String username) {
        this.username = username;
    }

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

    @Nullable
    public UserType getUserType() {
        return userType;
    }

    public void setUserType(@Nullable UserType userType) {
        this.userType = userType;
    }

    @Nullable
    public Boolean getActive() {
        return active;
    }

    public void setActive(@Nullable Boolean active) {
        this.active = active;
    }

    @Nullable
    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(@Nullable String newPassword) {
        this.newPassword = newPassword;
    }
}
