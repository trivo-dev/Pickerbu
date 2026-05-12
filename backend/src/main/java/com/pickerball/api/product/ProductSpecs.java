package com.pickerball.api.product;

import com.pickerball.api.user.User;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.lang.Nullable;

public final class ProductSpecs {

    private ProductSpecs() {
    }

    public static Specification<Product> withFilters(
            @Nullable String q,
            @Nullable String status,
            @Nullable Long ownerUserId) {
        return (root, query, cb) -> {
            List<Predicate> p = new ArrayList<>();
            if (q != null && !q.isBlank()) {
                String pattern = "%" + q.trim().toLowerCase() + "%";
                p.add(
                        cb.or(
                                cb.like(cb.lower(root.get("title")), pattern),
                                cb.and(
                                        cb.isNotNull(root.get("location")),
                                        cb.like(cb.lower(root.get("location")), pattern))));
            }
            if (status != null && !status.isBlank()) {
                p.add(cb.equal(cb.lower(root.get("status")), status.trim().toLowerCase()));
            }
            if (ownerUserId != null) {
                Join<Product, User> owner = root.join("owner");
                p.add(cb.equal(owner.get("id"), ownerUserId));
            }
            if (p.isEmpty()) {
                return cb.conjunction();
            }
            return cb.and(p.toArray(new Predicate[0]));
        };
    }
}
