# Thiết kế cơ sở dữ liệu — PickleBall (theo schema đang triển khai)

Tài liệu này mô tả **lược đồ hiện có trong backend** (`pickerball-api`): entity JPA, tên bảng/cột khớp PostgreSQL/H2 khi dùng Hibernate (`ddl-auto: update` trên profile `dev` / `pgsql`). Stack gợi ý: **PostgreSQL** + **Spring Boot** + **Angular**.

Mục **Đặc tả mở rộng** (facility nhiều court, OTP, outbox đa kênh, …) nằm ở cuối — là **hướng mở rộng**, **chưa** có bảng tương ứng trong repo.

---

## 1. Tóm tắt nghiệp vụ (ánh xạ schema hiện tại)

- **Vai trò**: `users.user_type` + bảng `roles` / `user_roles` — giá trị: **ADMIN**, **OWNER**, **PLAYER**.
- **Địa điểm cho thuê**: một bản ghi **`products`** (gom “sân / điểm đặt” trong một hàng); có lat/lng, tiện ích, ảnh, bảng giá theo khung giờ.
- **Đặt chỗ & thanh toán**: **`orders`** (đơn) + **`payments`**; trạng thái đơn enum **`OrderStatus`**; phương thức **`PaymentMethod`** (online/offline).
- **Lịch**: **`time_slots`** (slot theo sản phẩm); **`slot_holds`** giữ chỗ có **`expired_at`**.
- **Đánh giá**: **`product_rates`** (user + product + điểm + comment).
- **Ghép trận**: **`matches`** + **`match_players`**.
- **Thông báo**: **`notifications`** (user + nội dung + đã đọc).

---

## 2. Quyết định thiết kế (phiên bản đang code)

- **Không tách `facilities` / `courts`**: toàn bộ thông tin địa điểm hiển thị/đặt gộp trong **`products`** (mở rộng sau nếu cần tách cơ sở).
- **Thời gian**: `Instant` (UTC) cho khoảng thời gian đặt (`orders.start_time`, `end_time`, …); `LocalTime` cho **`product_prices`** (giờ trong ngày).
- **Đơn đặt**: bảng **`orders`** (entity Java: `CustomerOrder` — tránh từ khóa `Order`).
- **Tiền**: `NUMERIC`/`decimal` trong DB (`amount`, `price`, …).

---

## 3. Sơ đồ quan hệ (khối chính)

```text
roles <── user_roles ──> users
                            │
                            ├── owner ──< products ──< product_images
                            │              │
                            │              ├── product_prices
                            │              └── product_utility_mappings ──> product_utilities
                            │
                            ├──< orders ──< payments
                            │       └── product_id ──> products
                            │
                            ├──< slot_holds ──> products
                            ├──< time_slots ──> products
                            ├──< product_rates ──> products
                            ├──< notifications
                            │
match_players ──> matches ──> products
                └── user_id ──> users
```

---

## 4. Enum (ứng dụng → cột kiểu chuỗi trong DB)

| Enum | Giá trị | Ghi chú |
|------|---------|---------|
| `UserType` | ADMIN, OWNER, PLAYER | Cột `users.user_type` |
| `PaymentMethod` | OFFLINE, ONLINE | `orders.payment_method`, `payments.method` |
| `OrderStatus` | PENDING, CONFIRMED, CANCELLED, COMPLETED | `orders.status` |
| `MatchStatus` | WAITING, FULL, COMPLETED, CANCELLED | `matches.status` |

---

## 5. Danh sách bảng (chi tiết)

### 5.1 `users`

| Cột | Kiểu / ràng buộc | Mô tả |
|-----|-------------------|--------|
| `id` | PK, identity | |
| `username` | varchar(100), unique, not null | Đăng nhập có thể kèm email (API hiện dùng email cho JWT subject) |
| `password` | varchar(255), not null | Bcrypt |
| `email` | varchar(150), unique, not null | |
| `first_name`, `last_name` | varchar(100), nullable | |
| `avatar_url` | varchar(255), nullable | |
| `phone` | varchar(20), nullable | |
| `address` | varchar(255), nullable | |
| `level` | varchar(50), nullable | Text: Beginner / Intermediate / … |
| `user_type` | varchar, not null | ADMIN / OWNER / PLAYER |
| `is_active` | boolean, not null | |
| `created_at`, `updated_at` | timestamp, not null | |

### 5.2 `roles` và `user_roles`

| Bảng | Mô tả |
|------|--------|
| `roles` | `id` PK, `name` unique (ADMIN, OWNER, PLAYER) — seed khi khởi động |
| `user_roles` | PK composite `(user_id, role_id)` — đồng bộ với `user_type` (một role tương ứng) |

### 5.3 `products`

| Cột | Mô tả |
|-----|--------|
| `id` | PK |
| `title`, `description`, `location` | Thông tin hiển thị |
| `lat`, `lng` | decimal(10,6), nullable |
| `rate` | decimal(2,1), default 0 — điểm TB / rating aggregate |
| `owner_id` | FK → `users.id`, nullable |
| `status` | varchar (vd. active / inactive) |
| `created_at` | timestamp |

### 5.4 Phụ trợ sản phẩm

| Bảng | Mô tả |
|------|--------|
| `product_images` | `product_id` FK, `image_url` |
| `product_utilities` | Danh mục tiện ích (`name`) |
| `product_utility_mappings` | N-N `products` ↔ `product_utilities` |
| `product_prices` | `product_id`, `start_time`, `end_time` (time), `price`, `is_weekend` |

### 5.5 Lịch, giữ chỗ, đơn, thanh toán

| Bảng | Mô tả |
|------|--------|
| `time_slots` | `product_id`, `start_time`, `end_time`, `is_booked` |
| `slot_holds` | `user_id`, `product_id`, `start_time`, `end_time`, `expired_at` |
| `orders` | `user_id`, `product_id`, `start_time`, `end_time`, `status`, `payment_method`, `number_player`, `amount`, `created_at` |
| `payments` | `order_id`, `amount`, `method`, `status`, `transaction_code`, `created_at` |

### 5.6 Đánh giá, ghép trận, thông báo

| Bảng | Mô tả |
|------|--------|
| `product_rates` | `user_id`, `product_id`, `rate_number`, `comment`, `created_at` |
| `matches` | `product_id`, `start_time`, `level`, `status` |
| `match_players` | PK `(match_id, user_id)` |
| `notifications` | `user_id`, `content`, `is_read`, `created_at` |

---

## 6. Chỉ mục (index)

Một số cột thường dùng để lọc / JOIN đã khai báo **`@Index`** trên entity (`users.user_type`, `products.owner_id`, `orders.product_id`, …). Hibernate tạo/cập nhật index khi schema được cập nhật.

---

## 7. Triển khai & vận hành

- **Schema**: Hibernate **`ddl-auto: update`** (`dev`, `pgsql`) — **không** có file Flyway trong repo; production nên chuyển **Flyway/Liquibase** + `ddl-auto: validate`.
- **Thời gian**: ưu tiên **UTC** ở ứng dụng; JDBC `time_zone: UTC` (xem `application.yml`).
- **Tiền tệ**: amount/price dạng decimal phù hợp VND (scale theo entity).

---

## 8. API backend đã map (tham chiếu)

- Người dùng / auth: `/api/v1/auth/*`, `/api/v1/users/me`, `/api/v1/admin/users`
- Sản phẩm: `/api/v1/admin/products`, `/api/v1/public/products`

Các bảng **`orders`**, **`payments`**, **`time_slots`**, … hiện **chưa** có REST công khai đầy đủ trong repo — schema phục vụ mở rộng.

Chi tiết endpoint: `backend/README.md`.

---

## 9. Đặc tả mở rộng (chưa có trong DB hiện tại)

Các ý sau **xuất phát từ đặc tả nghiệp vụ đặt sân đầy đủ** — có thể thêm sau khi chốt scope:

| Hướng | Ghi chú |
|-------|---------|
| **facility + court** | Tách địa điểm: một cơ sở nhiều sân; đặt chỗ theo court |
| **bookings** vs **orders** | Đặt tên/ Luồng draft / pending_payment / participants |
| **OTP** | Bảng xác thực email/SĐT |
| **Giờ mở / block / lễ** | `operating_hours`, `blocked_slots`, … |
| **Pricing tiers** | Thay/thêm vào `product_prices` |
| **invoice / cổng TT chi tiết** | Payload gateway, hóa đơn |
| **notification_outbox** | Hàng đợi đa kênh, retry |
| **Trùng lịch** | EXCLUDE constraint PostgreSQL hoặc kiểm tra ứng dụng |

---

## 10. Lịch sử tài liệu

- Phiên bản trước mô tả **`facilities`/`bookings`/`court_reviews`** và phụ lục **`app_users`/`app_courts`/gallery** — **không còn** khớp code sau khi chuyển schema **`users` + `products` + `orders`**.
- File này được **đồng bộ với schema đang triển khai** trong repository.
