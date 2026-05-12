package com.pickerball.api.web.dto;

import com.pickerball.api.user.UserType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.lang.Nullable;

public class AdminUserCreateRequest {

    @NotBlank
    @Size(min = 3, max = 100)
    private String username;

    @NotBlank
    @Email
    @Size(max = 150)
    private String email;

    @NotBlank
    @Size(min = 8, max = 255)
    private String password;

    @Nullable
    @Size(max = 100)
    private String firstName;

    @Nullable
    @Size(max = 100)
    private String lastName;

    @Nullable
    @Size(max = 20)
    private String phone;

    @Nullable
    @Size(max = 255)
    private String address;

    @Nullable
    @Size(max = 50)
    private String level;

    @NotNull
    private UserType userType = UserType.PLAYER;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public UserType getUserType() {
        return userType;
    }

    public void setUserType(UserType userType) {
        this.userType = userType;
    }
}
