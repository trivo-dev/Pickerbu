package com.pickerball.api.web;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> badRequest(
            MethodArgumentNotValidException ex,
            @Nullable HttpServletRequest request
    ) {
        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .collect(
                        Collectors.toMap(
                                FieldError::getField,
                                e -> e.getDefaultMessage() != null ? e.getDefaultMessage() : "Invalid",
                                (a, b) -> a
                        )
                );
        String first = "Invalid request";
        if (!ex.getBindingResult().getFieldErrors().isEmpty()) {
            FieldError fe = ex.getBindingResult().getFieldErrors().get(0);
            if (fe.getDefaultMessage() != null) {
                first = fe.getDefaultMessage();
            }
        }
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new ApiError(
                                400,
                                "Bad Request",
                                first,
                                request != null ? request.getRequestURI() : null,
                                fieldErrors,
                                java.time.Instant.now()
                        )
                );
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> conflict(
            ConstraintViolationException ex,
            @Nullable HttpServletRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        ApiError.of(
                                400,
                                "Bad Request",
                                ex.getMessage(),
                                request != null ? request.getRequestURI() : null
                        )
                );
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> status(ResponseStatusException ex, @Nullable HttpServletRequest request) {
        HttpStatusCode sc = ex.getStatusCode();
        int value = sc.value();
        String phrase = sc instanceof HttpStatus h ? h.getReasonPhrase() : "Error";
        String msg = ex.getReason() != null ? ex.getReason() : phrase;
        return ResponseEntity
                .status(sc)
                .body(ApiError.of(value, phrase, msg, request != null ? request.getRequestURI() : null));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiError> notFound(NoResourceFoundException ex, @Nullable HttpServletRequest request) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        ApiError.of(
                                404,
                                "Not Found",
                                ex.getMessage(),
                                request != null ? request.getRequestURI() : null
                        )
                );
    }
}
