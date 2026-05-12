package com.pickerball.api.config;

import com.pickerball.api.user.Role;
import com.pickerball.api.user.RoleRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(0)
public class RolesInitializer implements ApplicationRunner {

    private final RoleRepository roleRepository;

    public RolesInitializer(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        ensureRole("ADMIN");
        ensureRole("OWNER");
        ensureRole("PLAYER");
    }

    private void ensureRole(String name) {
        if (roleRepository.findByName(name).isEmpty()) {
            roleRepository.save(new Role(name));
        }
    }
}
