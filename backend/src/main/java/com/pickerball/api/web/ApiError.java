package com.pickerball.api.web;

import java.time.Instant;
import java.util.Map;
import org.springframework.lang.Nullable;

public record ApiError(
        int status,
        String error,
        String message,
        @Nullable String path,
        @Nullable Map<String, String> fieldErrors,
        Instant timestamp
) {
    public static ApiError of(
            int status,
            String error,
            String message,
            @Nullable String path
    ) {
        return new ApiError(status, error, message, path, null, Instant.now());
    }
}
