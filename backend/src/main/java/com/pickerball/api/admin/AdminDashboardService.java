package com.pickerball.api.admin;

import com.pickerball.api.booking.CustomerOrder;
import com.pickerball.api.booking.CustomerOrderRepository;
import com.pickerball.api.product.ProductImageRepository;
import com.pickerball.api.product.ProductRepository;
import com.pickerball.api.user.UserRepository;
import com.pickerball.api.user.UserType;
import com.pickerball.api.web.dto.DailyCountPointDto;
import com.pickerball.api.web.dto.DashboardStatsResponse;
import com.pickerball.api.web.dto.DashboardSummaryDto;
import com.pickerball.api.web.dto.NamedCountDto;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final CustomerOrderRepository customerOrderRepository;

    public AdminDashboardService(
            UserRepository userRepository,
            ProductRepository productRepository,
            ProductImageRepository productImageRepository,
            CustomerOrderRepository customerOrderRepository
    ) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.customerOrderRepository = customerOrderRepository;
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats() {
        ZoneId zone = ZoneId.systemDefault();
        LocalDate end = LocalDate.now(zone);
        LocalDate start = end.minusDays(13);
        Instant sinceInstant = start.atStartOfDay(zone).toInstant();
        Timestamp sinceTs = Timestamp.from(sinceInstant);

        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByActiveTrue();
        long inactiveUsers = userRepository.countByActiveFalse();

        List<NamedCountDto> usersByType = new ArrayList<>();
        for (Object[] row : userRepository.countGroupedByUserType()) {
            UserType ut = (UserType) row[0];
            Number n = (Number) row[1];
            usersByType.add(new NamedCountDto(ut.name(), n.longValue()));
        }

        long totalProducts = productRepository.count();
        long activeProducts = productRepository.countByStatusIgnoreCase("active");
        long inactiveProducts = productRepository.countByStatusIgnoreCase("inactive");
        long totalImages = productImageRepository.count();

        DashboardSummaryDto summary = new DashboardSummaryDto(
                totalUsers,
                activeUsers,
                inactiveUsers,
                totalProducts,
                activeProducts,
                inactiveProducts,
                totalImages);

        List<DailyCountPointDto> productsDaily =
                fillDailySeries(start, end, productRepository.countProductsCreatedPerDaySince(sinceTs));
        List<DailyCountPointDto> usersDaily =
                fillDailySeries(start, end, userRepository.countUsersRegisteredPerDaySince(sinceTs));
        List<DailyCountPointDto> ordersMonthly = fillOrdersByMonth(6, zone, customerOrderRepository);

        return new DashboardStatsResponse(summary, usersByType, productsDaily, usersDaily, ordersMonthly);
    }

    private static List<DailyCountPointDto> fillDailySeries(
            LocalDate start, LocalDate end, List<Object[]> rows
    ) {
        Map<LocalDate, Long> map = new HashMap<>();
        for (Object[] row : rows) {
            if (row[0] instanceof java.sql.Date sqlDay) {
                Number cnt = (Number) row[1];
                map.put(sqlDay.toLocalDate(), cnt.longValue());
            }
        }
        List<DailyCountPointDto> out = new ArrayList<>();
        for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
            out.add(new DailyCountPointDto(d.toString(), map.getOrDefault(d, 0L)));
        }
        return out;
    }

    private static List<DailyCountPointDto> fillOrdersByMonth(
            int monthCount, ZoneId zone, CustomerOrderRepository customerOrderRepository
    ) {
        YearMonth nowYm = YearMonth.from(LocalDate.now(zone));
        YearMonth startYm = nowYm.minusMonths(monthCount - 1L);
        Instant since = startYm.atDay(1).atStartOfDay(zone).toInstant();
        Map<YearMonth, Long> counts = new HashMap<>();
        for (CustomerOrder o : customerOrderRepository.findByCreatedAtAfter(since)) {
            YearMonth ym = YearMonth.from(o.getCreatedAt().atZone(zone));
            counts.merge(ym, 1L, Long::sum);
        }
        List<DailyCountPointDto> out = new ArrayList<>();
        for (YearMonth ym = startYm; !ym.isAfter(nowYm); ym = ym.plusMonths(1)) {
            out.add(new DailyCountPointDto(ym.atDay(1).toString(), counts.getOrDefault(ym, 0L)));
        }
        return out;
    }
}
