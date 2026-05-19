package com.pickerball.api.user;

import org.springframework.stereotype.Component;

@Component
public class UserRoleSync {

    private final RoleRepository roleRepository;

    public UserRoleSync(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    /** Keeps {@code user_roles} aligned with {@code user_type} (single role row per team schema). */
    public void syncRolesFromUserType(User user) {
        user.getRoles().clear();
        Role r = roleRepository
                .findByName(user.getUserType().name())
                .orElseThrow(() -> new IllegalStateException("Missing roles row: " + user.getUserType().name()));
        user.getRoles().add(r);
    }
}
