package com.pickerball.api.product;

import com.pickerball.api.web.dto.PageResponse;
import com.pickerball.api.web.dto.ProductResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public/products")
public class PublicProductController {

    private final PublicProductService publicProductService;

    public PublicProductController(PublicProductService publicProductService) {
        this.publicProductService = publicProductService;
    }

    @GetMapping
    public PageResponse<ProductResponse> list(
            @RequestParam(required = false) @Nullable String q,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return publicProductService.listActive(q, pageable);
    }

    @GetMapping("/{id}")
    public ProductResponse get(@PathVariable long id) {
        return publicProductService.getByIdIfActive(id);
    }
}
