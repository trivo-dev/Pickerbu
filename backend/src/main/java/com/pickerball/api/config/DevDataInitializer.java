package com.pickerball.api.config;

import com.pickerball.api.user.User;
import com.pickerball.api.user.UserRepository;
import com.pickerball.api.user.UserRoleSync;
import com.pickerball.api.user.UserType;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Tạo tài khoản admin mặc định khi chưa có admin active (chỉ profile {@code dev}). Email:
 * admin@pickerball.local, mật khẩu: Admin12345 — đổi ngay trên môi trường thật.
 */
@Configuration
@Profile("dev")
public class DevDataInitializer {

    @Bean
    CommandLineRunner seedAdminIfMissing(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            UserRoleSync userRoleSync
    ) {
        return args -> {
            if (userRepository.countByUserTypeAndActiveTrue(UserType.ADMIN) > 0) {
                return;
            }
            User u = new User();
            u.setUsername("admin");
            u.setEmail("admin@pickerball.local");
            u.setPassword(passwordEncoder.encode("Admin12345"));
            u.setFirstName("System");
            u.setLastName("Admin");
            u.setUserType(UserType.ADMIN);
            u.setActive(true);
            userRoleSync.syncRolesFromUserType(u);
            userRepository.save(u);
        };
    }
}
