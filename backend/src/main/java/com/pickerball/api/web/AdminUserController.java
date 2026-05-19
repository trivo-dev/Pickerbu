package com.pickerball.api.web;

import com.pickerball.api.admin.AdminUserService;
import com.pickerball.api.user.UserType;
import com.pickerball.api.web.dto.AdminUserCreateRequest;
import com.pickerball.api.web.dto.AdminUserUpdateRequest;
import com.pickerball.api.web.dto.PageResponse;
import com.pickerball.api.web.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.lang.Nullable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public PageResponse<UserResponse> list(
            @RequestParam(required = false) @Nullable String q,
            @RequestParam(required = false) @Nullable UserType userType,
            @RequestParam(required = false) @Nullable Boolean active,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return adminUserService.list(q, userType, active, pageable);
    }

    @GetMapping("/{id}")
    public UserResponse get(@PathVariable long id) {
        return adminUserService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse create(@Valid @RequestBody AdminUserCreateRequest request) {
        return adminUserService.create(request);
    }

    @PutMapping("/{id}")
    public UserResponse update(@PathVariable long id, @Valid @RequestBody AdminUserUpdateRequest request) {
        return adminUserService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable long id) {
        adminUserService.delete(id);
    }
}
