package com.pickerball.api.admin;

import com.pickerball.api.security.SecurityUser;
import com.pickerball.api.user.User;
import com.pickerball.api.user.UserRepository;
import com.pickerball.api.user.UserRoleSync;
import com.pickerball.api.user.UserSpecs;
import com.pickerball.api.user.UserType;
import com.pickerball.api.web.dto.AdminUserCreateRequest;
import com.pickerball.api.web.dto.AdminUserUpdateRequest;
import com.pickerball.api.web.dto.PageResponse;
import com.pickerball.api.web.dto.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.lang.Nullable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserRoleSync userRoleSync;

    public AdminUserService(
            UserRepository userRepository, PasswordEncoder passwordEncoder, UserRoleSync userRoleSync
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userRoleSync = userRoleSync;
    }

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> list(
            @Nullable String q, @Nullable UserType userType, @Nullable Boolean active, Pageable pageable
    ) {
        var spec = UserSpecs.withFilters(q, userType, active);
        Page<User> page = userRepository.findAll(spec, pageable);
        return PageResponse.of(page.map(UserResponse::from));
    }

    @Transactional(readOnly = true)
    public UserResponse getById(long id) {
        User u = findUser(id);
        return UserResponse.from(u);
    }

    @Transactional
    public UserResponse create(AdminUserCreateRequest req) {
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
        u.setFirstName(req.getFirstName() != null ? req.getFirstName().trim() : null);
        u.setLastName(req.getLastName() != null ? req.getLastName().trim() : null);
        u.setAddress(trimToNull(req.getAddress()));
        u.setLevel(trimToNull(req.getLevel()));
        u.setUserType(req.getUserType() != null ? req.getUserType() : UserType.PLAYER);
        u.setActive(true);
        userRoleSync.syncRolesFromUserType(u);
        u = userRepository.save(u);
        return UserResponse.from(u);
    }

    @Transactional
    public UserResponse update(long id, AdminUserUpdateRequest req) {
        User u = findUser(id);
        long currentId = requireCurrentUserId();

        if (Boolean.FALSE.equals(req.getActive())) {
            assertCanDeactivate(u, currentId);
        }
        if (req.getUserType() != null
                && req.getUserType() != UserType.ADMIN
                && u.getUserType() == UserType.ADMIN) {
            assertNotLastActiveAdminIfDemoting(id, u);
        }
        if (StringUtils.hasText(req.getEmail())) {
            String em = req.getEmail().trim().toLowerCase();
            if (!em.equals(u.getEmail()) && userRepository.existsByEmailIgnoreCase(em)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already in use");
            }
            u.setEmail(em);
        }
        if (StringUtils.hasText(req.getUsername())) {
            String un = req.getUsername().trim();
            if (!un.equalsIgnoreCase(u.getUsername()) && userRepository.existsByUsernameIgnoreCase(un)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already in use");
            }
            u.setUsername(un);
        }
        if (StringUtils.hasText(req.getFirstName())) {
            u.setFirstName(req.getFirstName().trim());
        }
        if (req.getLastName() != null) {
            u.setLastName(trimToNull(req.getLastName()));
        }
        if (req.getPhone() != null) {
            String phone = normalizePhone(req.getPhone());
            if (StringUtils.hasText(phone)
                    && !phone.equals(u.getPhone())
                    && userRepository.existsOtherWithPhone(phone, u.getId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone is already in use");
            }
            u.setPhone(phone);
        }
        if (StringUtils.hasText(req.getAvatarUrl())) {
            u.setAvatarUrl(req.getAvatarUrl().trim());
        } else if (req.getAvatarUrl() != null && req.getAvatarUrl().isEmpty()) {
            u.setAvatarUrl(null);
        }
        if (req.getAddress() != null) {
            u.setAddress(trimToNull(req.getAddress()));
        }
        if (req.getLevel() != null) {
            u.setLevel(trimToNull(req.getLevel()));
        }
        if (req.getUserType() != null) {
            u.setUserType(req.getUserType());
            userRoleSync.syncRolesFromUserType(u);
        }
        if (req.getActive() != null) {
            u.setActive(req.getActive());
        }
        if (StringUtils.hasText(req.getNewPassword())) {
            u.setPassword(passwordEncoder.encode(req.getNewPassword()));
        }
        return UserResponse.from(u);
    }

    @Transactional
    public void delete(long id) {
        User u = findUser(id);
        if (u.getId() == requireCurrentUserId()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Cannot delete or deactivate your own account here");
        }
        if (u.getUserType() == UserType.ADMIN
                && userRepository.countByUserTypeAndActiveTrue(UserType.ADMIN) <= 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot remove the only admin account");
        }
        u.setActive(false);
    }

    private void assertCanDeactivate(User target, long currentId) {
        if (target.getId() == currentId) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot deactivate yourself");
        }
        if (target.isActive()
                && target.getUserType() == UserType.ADMIN
                && userRepository.countByUserTypeAndActiveTrue(UserType.ADMIN) <= 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot deactivate the only active admin");
        }
    }

    private void assertNotLastActiveAdminIfDemoting(long id, User u) {
        if (!u.isActive()) {
            return;
        }
        if (userRepository.countByUserTypeAndActiveTrue(UserType.ADMIN) <= 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Cannot change role: this is the only active admin");
        }
    }

    private User findUser(long id) {
        return userRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private static long requireCurrentUserId() {
        var a = SecurityContextHolder.getContext().getAuthentication();
        if (a != null && a.getPrincipal() instanceof SecurityUser s) {
            return s.getId();
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
    }

    private static String normalizePhone(String phone) {
        if (phone == null) {
            return null;
        }
        String t = phone.trim();
        return t.isEmpty() ? null : t;
    }

    private static String trimToNull(String s) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
