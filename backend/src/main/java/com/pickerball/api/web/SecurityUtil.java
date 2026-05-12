package com.pickerball.api.web;

import com.pickerball.api.security.SecurityUser;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

public final class SecurityUtil {

    private SecurityUtil() {
    }

    public static SecurityUser requireCurrentUser() {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        if (a == null || !(a.getPrincipal() instanceof SecurityUser u)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        return u;
    }
}
