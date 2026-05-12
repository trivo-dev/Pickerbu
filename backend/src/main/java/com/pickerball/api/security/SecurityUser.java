package com.pickerball.api.security;

import com.pickerball.api.user.User;
import com.pickerball.api.user.UserType;
import java.util.List;
import org.springframework.lang.NonNull;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class SecurityUser implements UserDetails {

    private final long id;
    @NonNull
    private final String email;
    @NonNull
    private final String encodedPassword;
    @NonNull
    private final List<GrantedAuthority> authorities;
    private final boolean accountNonLocked;

    public SecurityUser(
            long id,
            @NonNull String email,
            @NonNull String encodedPassword,
            UserType userType,
            boolean active
    ) {
        this.id = id;
        this.email = email;
        this.encodedPassword = encodedPassword;
        this.authorities = List.of(new SimpleGrantedAuthority("ROLE_" + userType.name()));
        this.accountNonLocked = active;
    }

    public static SecurityUser from(User u) {
        return new SecurityUser(
                u.getId(),
                u.getEmail().toLowerCase(),
                u.getPassword(),
                u.getUserType(),
                u.isActive()
        );
    }

    public long getId() {
        return id;
    }

    @Override
    @NonNull
    public String getUsername() {
        return email;
    }

    @Override
    @NonNull
    public String getPassword() {
        return encodedPassword;
    }

    @Override
    @NonNull
    public List<GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return accountNonLocked;
    }
}
