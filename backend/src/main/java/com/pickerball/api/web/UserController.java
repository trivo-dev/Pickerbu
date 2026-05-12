package com.pickerball.api.web;

import com.pickerball.api.user.AccountService;
import com.pickerball.api.web.dto.ChangePasswordRequest;
import com.pickerball.api.web.dto.UpdateProfileRequest;
import com.pickerball.api.web.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final AccountService accountService;

    public UserController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PutMapping("/me")
    public UserResponse updateMe(@Valid @RequestBody UpdateProfileRequest request) {
        long id = SecurityUtil.requireCurrentUser().getId();
        return accountService.updateProfile(id, request);
    }

    @PutMapping("/me/password")
    public void changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        long id = SecurityUtil.requireCurrentUser().getId();
        accountService.changePassword(id, request.getCurrentPassword(), request.getNewPassword());
    }
}
