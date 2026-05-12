package com.pickerball.api.web.dto;

import com.pickerball.api.product.Product;
import java.math.BigDecimal;
import java.time.Instant;
import org.springframework.lang.Nullable;

public record ProductResponse(
        long id,
        String title,
        @Nullable String description,
        @Nullable String location,
        @Nullable BigDecimal lat,
        @Nullable BigDecimal lng,
        BigDecimal rate,
        @Nullable Long ownerUserId,
        @Nullable String ownerEmail,
        String status,
        Instant createdAt
) {
    public static ProductResponse from(Product p) {
        Long oid = p.getOwner() != null ? p.getOwner().getId() : null;
        String oemail = p.getOwner() != null ? p.getOwner().getEmail() : null;
        return new ProductResponse(
                p.getId(),
                p.getTitle(),
                p.getDescription(),
                p.getLocation(),
                p.getLat(),
                p.getLng(),
                p.getRate(),
                oid,
                oemail,
                p.getStatus(),
                p.getCreatedAt());
    }
}
