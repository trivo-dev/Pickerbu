package com.pickerball.api.security;

import com.pickerball.api.user.User;
import com.pickerball.api.user.UserRepository;
import org.springframework.lang.NonNull;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User u = userRepository
                .findByEmailIgnoreCase(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return SecurityUser.from(u);
    }

    @Transactional(readOnly = true)
    public @NonNull SecurityUser loadById(long id) {
        User u = userRepository
                .findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: id=" + id));
        return SecurityUser.from(u);
    }
}
