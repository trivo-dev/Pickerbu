package com.pickerball.api.product;

import com.pickerball.api.user.User;
import com.pickerball.api.user.UserRepository;
import com.pickerball.api.web.dto.PageResponse;
import com.pickerball.api.web.dto.ProductCreateRequest;
import com.pickerball.api.web.dto.ProductResponse;
import com.pickerball.api.web.dto.ProductUpdateRequest;
import java.math.BigDecimal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public AdminProductService(ProductRepository productRepository, UserRepository userRepository) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> list(
            @Nullable String q, @Nullable String status, @Nullable Long ownerUserId, Pageable pageable
    ) {
        Specification<Product> spec = ProductSpecs.withFilters(q, status, ownerUserId);
        Page<Product> page = productRepository.findAll(spec, pageable);
        return PageResponse.of(page.map(ProductResponse::from));
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(long id) {
        Product p = findProduct(id);
        return ProductResponse.from(p);
    }

    @Transactional
    public ProductResponse create(ProductCreateRequest req) {
        Product p = new Product();
        p.setTitle(req.getTitle().trim());
        p.setDescription(req.getDescription());
        p.setLocation(trimToNull(req.getLocation()));
        p.setLat(req.getLat());
        p.setLng(req.getLng());
        p.setRate(req.getRate() != null ? req.getRate() : BigDecimal.ZERO);
        p.setStatus(normalizeStatus(req.getStatus()));
        p.setOwner(resolveOwner(req.getOwnerUserId()));
        p = productRepository.save(p);
        return ProductResponse.from(p);
    }

    @Transactional
    public ProductResponse update(long id, ProductUpdateRequest req) {
        Product p = findProduct(id);
        if (StringUtils.hasText(req.getTitle())) {
            p.setTitle(req.getTitle().trim());
        }
        if (req.getDescription() != null) {
            p.setDescription(req.getDescription());
        }
        if (req.getLocation() != null) {
            p.setLocation(trimToNull(req.getLocation()));
        }
        if (req.getLat() != null) {
            p.setLat(req.getLat());
        }
        if (req.getLng() != null) {
            p.setLng(req.getLng());
        }
        if (req.getRate() != null) {
            p.setRate(req.getRate());
        }
        if (req.getStatus() != null) {
            p.setStatus(normalizeStatus(req.getStatus()));
        }
        if (Boolean.TRUE.equals(req.getClearOwner())) {
            p.setOwner(null);
        } else if (req.getOwnerUserId() != null) {
            p.setOwner(resolveOwner(req.getOwnerUserId()));
        }
        return ProductResponse.from(p);
    }

    @Transactional
    public void delete(long id) {
        if (!productRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }
        productRepository.deleteById(id);
    }

    private Product findProduct(long id) {
        return productRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    @Nullable
    private User resolveOwner(@Nullable Long ownerUserId) {
        if (ownerUserId == null) {
            return null;
        }
        return userRepository
                .findById(ownerUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Owner user not found"));
    }

    private static String normalizeStatus(@Nullable String status) {
        if (!StringUtils.hasText(status)) {
            return "active";
        }
        return status.trim().toLowerCase();
    }

    private static String trimToNull(String s) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
