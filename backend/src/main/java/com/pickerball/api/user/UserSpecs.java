package com.pickerball.api.user;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.lang.Nullable;

public final class UserSpecs {

    private UserSpecs() {
    }

    public static Specification<User> withFilters(
            @Nullable String q,
            @Nullable UserType userType,
            @Nullable Boolean active) {
        return (root, query, cb) -> {
            List<Predicate> p = new ArrayList<>();
            if (q != null && !q.isBlank()) {
                String pattern = "%" + q.trim().toLowerCase() + "%";
                p.add(
                        cb.or(
                                cb.like(cb.lower(root.get("email")), pattern),
                                cb.like(cb.lower(root.get("username")), pattern),
                                cb.like(cb.lower(cb.coalesce(root.get("firstName"), "")), pattern),
                                cb.like(cb.lower(cb.coalesce(root.get("lastName"), "")), pattern)));
            }
            if (userType != null) {
                p.add(cb.equal(root.get("userType"), userType));
            }
            if (active != null) {
                p.add(cb.equal(root.get("active"), active));
            }
            if (p.isEmpty()) {
                return cb.conjunction();
            }
            return cb.and(p.toArray(new Predicate[0]));
        };
    }
}
