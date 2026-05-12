package com.pickerball.api.web;

import com.pickerball.api.product.AdminProductService;
import com.pickerball.api.web.dto.PageResponse;
import com.pickerball.api.web.dto.ProductCreateRequest;
import com.pickerball.api.web.dto.ProductResponse;
import com.pickerball.api.web.dto.ProductUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.lang.Nullable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/products")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    private final AdminProductService adminProductService;

    public AdminProductController(AdminProductService adminProductService) {
        this.adminProductService = adminProductService;
    }

    @GetMapping
    public PageResponse<ProductResponse> list(
            @RequestParam(required = false) @Nullable String q,
            @RequestParam(required = false) @Nullable String status,
            @RequestParam(required = false) @Nullable Long ownerUserId,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return adminProductService.list(q, status, ownerUserId, pageable);
    }

    @GetMapping("/{id}")
    public ProductResponse get(@PathVariable long id) {
        return adminProductService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@Valid @RequestBody ProductCreateRequest request) {
        return adminProductService.create(request);
    }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable long id, @Valid @RequestBody ProductUpdateRequest request) {
        return adminProductService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable long id) {
        adminProductService.delete(id);
    }
}
