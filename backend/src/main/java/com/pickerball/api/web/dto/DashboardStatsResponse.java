package com.pickerball.api.web.dto;

import java.util.List;

public record DashboardStatsResponse(
        DashboardSummaryDto summary,
        List<NamedCountDto> usersByUserType,
        List<DailyCountPointDto> productsCreatedDaily,
        List<DailyCountPointDto> usersRegisteredDaily,
        List<DailyCountPointDto> ordersByMonth
) {}
