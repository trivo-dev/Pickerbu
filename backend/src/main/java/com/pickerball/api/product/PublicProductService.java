package com.pickerball.api.product;

import com.pickerball.api.web.dto.PageResponse;
import com.pickerball.api.web.dto.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PublicProductService {

    private final ProductRepository productRepository;

    public PublicProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> listActive(@Nullable String q, Pageable pageable) {
        Specification<Product> spec = ProductSpecs.withFilters(q, "active", null);
        Page<Product> page = productRepository.findAll(spec, pageable);
        return PageResponse.of(page.map(ProductResponse::from));
    }

    @Transactional(readOnly = true)
    public ProductResponse getByIdIfActive(long id) {
        Product p = productRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        if (p.getStatus() == null || !"active".equalsIgnoreCase(p.getStatus())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }
        return ProductResponse.from(p);
    }
}
