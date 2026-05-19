package com.pickerball.api.web.dto;

public record DashboardSummaryDto(
        long totalUsers,
        long activeUsers,
        long inactiveUsers,
        long totalProducts,
        long activeProducts,
        long inactiveProducts,
        long totalProductImages
) {}
