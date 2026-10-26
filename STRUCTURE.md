# Cấu trúc dự án – Website đặt sân thể thao trực tuyến và quản lý lịch sân

> Đồ án tốt nghiệp – Hà Thế Hưng (211211680) – CNTT5 K62 – GVHD: ThS. Đinh Công Tùng
> Công nghệ: ReactJS + Vite | Node.js + Express.js | SQL Server | RESTful API | JWT | bcrypt
>
> File này là **nguồn sự thật về kiến trúc**. Thêm/đổi thư mục, file, thư viện → cập nhật file này trước.
> Quy tắc code chi tiết nằm trong `.cursor/rules/`.

Ký hiệu trạng thái: ✅ đã xong · 🟡 đang làm · ⬜ chưa làm

---

## 1. Kiến trúc tổng thể

```
Trình duyệt (React SPA)
        │  HTTPS, JSON, Bearer access token + cookie refresh token
        ▼
Vite dev proxy / Nginx (production)  ──  /api/*, /uploads/*  ──►  Express API (Node.js)
                                                                 │  routes → controller → service → repository
                                                                 ▼
                                                            SQL Server (mssql pool)
```

- Frontend và API chạy **cùng origin** (qua proxy) để cookie refresh token `sameSite=strict` hoạt động.
- Backend chia theo **module nghiệp vụ**; mỗi module có đủ các tầng routes / controller / service / repository / validation.

---

## 2. Cây thư mục

```
HTH_211211680_UTC/
├── .cursor/rules/                     # Quy tắc cho AI sinh code đúng kiến trúc
│   ├── 00-project-core.mdc            # Công nghệ, nguyên tắc chung, hằng số (luôn áp dụng)
│   ├── 10-backend.mdc                 # Phân tầng backend, chuẩn response, bảo mật
│   ├── 20-business-rules.mdc          # Quy tắc nghiệp vụ BR01–BR16
│   ├── 30-frontend.mdc                # Tổ chức React theo feature, quy tắc UI
│   └── 40-database.mdc                # Migration, đặt tên, truy vấn SQL Server
├── STRUCTURE.md                       # File này
├── README.md                          # Giới thiệu + hướng dẫn chạy
├── reportChap2.md                     # Chương 2 báo cáo (nguồn Markdown)
├── reportChap2.docx                   # Chương 2 báo cáo (Word, xuất từ .md bằng Pandoc)
├── reportChap3.md                     # Chương 3 báo cáo: triển khai Backend/API/CSDL (giải thích intern)
├── reportChap4.md                     # Chương 4 báo cáo: Frontend React, luồng đặt/thanh toán/hủy/admin
├── reportChap4.docx                   # Chương 4 báo cáo (Word, xuất từ .md bằng Pandoc)
├── .gitignore
│
├── database/                          # CSDL SQL Server
│   ├── migrations/
│   │   ├── 001_init_schema.sql        # Tạo 8 bảng, ràng buộc, index chống đặt trùng
│   │   └── 002_site_content.sql       # NewsPosts, PartnerItems (tin tức & đối tác)
│   └── seeds/
│       ├── 001_master_data.sql        # Loại sân, khung giờ, sân, bảng giá mẫu (idempotent)
│       ├── 002_site_content.sql       # Bài tin & thẻ đối tác mẫu (idempotent)
│       └── 003_admin_profile.sql      # Đồng bộ hồ sơ Admin đồ án (idempotent)
│
├── backend/
│   ├── scripts/
│   │   ├── migrate.js                 # Tạo DB nếu chưa có, chạy migration chưa áp dụng, ghi SchemaMigrations
│   │   └── seed.js                    # Chạy seeds/*.sql + tạo tài khoản Admin (bcrypt) từ .env
│   ├── src/
│   │   ├── server.js                  # Khởi động: kết nối DB, listen, chạy job, graceful shutdown
│   │   ├── app.js                     # Dựng Express app: helmet, cors, json, cookie, log, rate-limit, routes, lỗi
│   │   ├── config/
│   │   │   ├── env.js                 # Đọc + validate biến môi trường (Zod), export config bất biến
│   │   │   ├── logger.js              # Logger pino (ẩn token/password)
│   │   │   └── database.js            # Pool mssql, getPool, closePool, withTransaction, createRequest
│   │   ├── constants/
│   │   │   ├── roles.js               # Admin, Customer
│   │   │   ├── booking.js             # Trạng thái đơn, thanh toán, bảng chuyển trạng thái, DayType
│   │   │   ├── field.js               # Trạng thái sân, trạng thái ô lịch (available/booked/...)
│   │   │   ├── content.js             # Trạng thái bài tin (Draft/Published)
│   │   │   └── errorCodes.js          # Mã lỗi dùng chung cho API
│   │   ├── middlewares/
│   │   │   ├── authenticate.js        # Xác thực JWT (bắt buộc / tùy chọn)
│   │   │   ├── authorize.js           # Phân quyền theo role
│   │   │   ├── validate.js            # Validate params/query/body bằng Zod → req.validated
│   │   │   ├── upload.js              # Multer upload ảnh sân
│   │   │   ├── rateLimiter.js         # Giới hạn request chung và cho /auth
│   │   │   ├── notFound.js            # 404 route
│   │   │   └── errorHandler.js        # Chuẩn hóa mọi lỗi → { success:false, error }
│   │   ├── utils/
│   │   │   ├── AppError.js            # Lớp lỗi nghiệp vụ (status, code, message, details)
│   │   │   ├── response.js            # ok / created / noContent
│   │   │   ├── pagination.js          # Tính offset, meta phân trang
│   │   │   ├── datetime.js            # dayjs + timezone VN, DayType, kiểm tra giờ đã qua
│   │   │   ├── password.js            # bcrypt hash / compare
│   │   │   ├── token.js               # Ký/kiểm tra JWT, sinh + băm refresh token
│   │   │   ├── sql.js                 # escapeLike, tham số IN, build câu UPDATE, nhận diện lỗi SQL
│   │   │   ├── fileStorage.js         # Đường dẫn public của ảnh, xóa file cũ
│   │   │   └── commonSchemas.js       # Zod dùng chung: id, ngày, giờ, phân trang, số điện thoại
│   │   ├── modules/
│   │   │   ├── auth/                  # Đăng ký, đăng nhập, refresh, đăng xuất, /me
│   │   │   │   ├── auth.routes.js · auth.controller.js · auth.service.js · auth.validation.js
│   │   │   │   └── refreshToken.repository.js
│   │   │   ├── users/                 # Hồ sơ cá nhân, đổi mật khẩu; Admin quản lý người dùng, khóa/mở
│   │   │   ├── fieldTypes/            # CRUD loại sân (bóng đá, cầu lông, tennis, pickleball)
│   │   │   ├── fields/                # CRUD sân + ảnh; tìm kiếm/lọc theo tên, loại, ngày, khung giờ, giá
│   │   │   ├── timeSlots/             # CRUD khung giờ theo loại sân, chống chồng lấn
│   │   │   ├── prices/                # Bảng giá theo sân × khung giờ × ngày thường/cuối tuần
│   │   │   ├── fieldClosures/         # Ngày sân nghỉ / bảo trì
│   │   │   ├── schedule/              # Lịch sân theo ngày (1 sân) và bảng trạng thái nhiều sân
│   │   │   ├── bookings/              # Đặt sân, chống trùng, thanh toán mô phỏng, hủy, Admin duyệt
│   │   │   ├── stats/                 # Tổng quan, doanh thu theo ngày/tháng, hiệu suất từng sân
│   │   │   ├── newsPosts/             # CRUD tin tức (GET public, POST/PATCH/DELETE Admin)
│   │   │   ├── partnerItems/          # CRUD đối tác hiển thị trang Khách hàng
│   │   │   └── siteContentUpload/     # POST upload ảnh tin tức/đối tác (Admin, multipart)
│   │   │       (mỗi module: *.routes.js · *.controller.js · *.service.js · *.repository.js · *.validation.js)
│   │   ├── jobs/
│   │   │   └── expirePendingBookings.js  # Mỗi phút hủy đơn Online quá hạn giữ chỗ
│   │   └── routes/
│   │       └── index.js               # Mount toàn bộ router dưới /api/v1 + /health
│   ├── tests/
│   │   ├── setupEnv.js                # Biến môi trường giả cho Jest
│   │   ├── unit/                      # datetime, token, sql, booking.service, newsPost.service
│   │   └── integration/               # app, auth, bookings (Supertest + CSDL)
│   ├── uploads/fields/                # Ảnh sân do Admin tải lên (không commit)
│   ├── uploads/site-content/          # Ảnh tin tức/đối tác do Admin tải lên (không commit)
│   ├── .env.example
│   ├── eslint.config.js
│   └── package.json
│
├── frontend/
│   ├── template/                      # Bản thiết kế HTML/CSS gốc – CHỈ THAM KHẢO, không import
│   ├── public/                        # favicon, news/* (ảnh tin tức/đối tác phục vụ URL tĩnh)
│   ├── src/
│   │   ├── main.jsx                   # Entry Vite, import CSS toàn cục
│   │   ├── app/
│   │   │   ├── App.jsx                # Gắn providers + router
│   │   │   ├── router.jsx             # Khai báo route client/admin/auth (lazy load)
│   │   │   └── queryClient.js         # Cấu hình TanStack Query
│   │   ├── api/
│   │   │   ├── httpClient.js          # Axios instance, gắn token, tự refresh khi 401
│   │   │   └── tokenStore.js          # Giữ access token trong bộ nhớ
│   │   ├── features/
│   │   │   ├── auth/                  # AuthContext, useAuth, ProtectedRoute, auth.api.js, schemas
│   │   │   ├── fields/                # API + hooks sân, FieldCard, FieldFilters
│   │   │   ├── fieldTypes/            # API + hooks loại sân
│   │   │   ├── timeSlots/             # API + hooks khung giờ
│   │   │   ├── prices/                # API + hooks bảng giá
│   │   │   ├── fieldClosures/         # API + hooks ngày nghỉ
│   │   │   ├── schedule/              # ScheduleBoard (bảng trạng thái), SlotPicker
│   │   │   ├── bookings/              # API + hooks đơn, BookingStatusBadge, BookingForm
│   │   │   ├── users/                 # API + hooks người dùng / hồ sơ
│   │   │   ├── stats/                 # API + hooks thống kê, RevenueChart, StatCard
│   │   │   ├── newsPosts/             # newsPosts.api.js
│   │   │   ├── partnerItems/          # partnerItems.api.js
│   │   │   └── siteContent/           # siteContentUpload.api.js (ảnh tin/đối tác)
│   │   ├── components/
│   │   │   ├── layout/                # Header, Footer, AdminSidebar
│   │   │   └── ui/                    # Modal, ConfirmDialog, Pagination, Spinner, EmptyState, ErrorState
│   │   ├── layouts/
│   │   │   ├── ClientLayout.jsx       # Header + Footer trang khách
│   │   │   ├── AdminLayout.jsx        # Sidebar quản trị
│   │   │   └── AuthLayout.jsx         # Nền trang đăng nhập/đăng ký
│   │   ├── pages/
│   │   │   ├── client/
│   │   │   │   ├── HomePage.jsx           # Trang chủ (template homepage)
│   │   │   │   ├── SearchFieldsPage.jsx   # Tìm kiếm, lọc sân
│   │   │   │   ├── FieldDetailPage.jsx    # Chi tiết sân + lịch theo ngày + chọn khung giờ
│   │   │   │   ├── BookingPage.jsx        # Phiếu đặt sân + bảng trạng thái (template booking)
│   │   │   │   ├── PaymentPage.jsx        # Thanh toán mô phỏng, đếm ngược giữ chỗ
│   │   │   │   ├── MyBookingsPage.jsx     # Lịch sử đặt sân, hủy đơn
│   │   │   │   ├── ProfilePage.jsx        # Thông tin cá nhân, đổi mật khẩu
│   │   │   │   ├── NewsPage.jsx           # Tin tức (template news)
│   │   │   │   ├── PartnersPage.jsx       # Đối tác (template customer)
│   │   │   │   └── ContactPage.jsx        # Liên hệ (template contact)
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx          # Template login
│   │   │   │   └── RegisterPage.jsx       # Template register
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx     # Tổng quan + liên kết Section 1/2
│   │   │   │   ├── AdminNewsPage.jsx      # CRUD tin tức
│   │   │   │   ├── AdminPartnersPage.jsx  # CRUD đối tác
│   │   │   │   ├── AdminBookingsPage.jsx  # Lọc, duyệt, hủy, hoàn thành đơn
│   │   │   │   ├── AdminFieldsPage.jsx    # Cập nhật trạng thái sân
│   │   │   │   └── AdminOrderStatusPage.jsx # Workflow chuyển trạng thái
│   │   │   │   (mở rộng sau: UsersPage, FieldTypesPage, TimeSlotsPage, PricesPage, biểu đồ doanh thu)
│   │   │   └── NotFoundPage.jsx
│   │   ├── constants/                 # routes.js, queryKeys.js, bookingLabels.js
│   │   ├── utils/                     # format.js, errors.js, date.js
│   │   ├── styles/                    # fonts.css, global.css, layout.css, admin.css, pages/*.css
│   │   └── assets/                    # fonts/, images/ (chép từ template)
│   ├── .env.example                   # VITE_API_BASE_URL
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js                 # Proxy /api, /uploads → backend
│
├── postman/
│   ├── SportBooking.postman_collection.json   # Collection kiểm thử API (Chương 5) — bổ sung sau
│   └── SportBooking.postman_environment.json  # baseUrl, accessToken, fieldId, bookingId...
└── docs/                              # (Giai đoạn 6) — chưa tạo thư mục
    └── test-cases.md                  # Kịch bản kiểm thử Chương 5
```

---

## 3. Thiết kế CSDL (tóm tắt)

| Bảng | Vai trò | Ràng buộc chính |
|---|---|---|
| `Users` | Khách hàng + Admin | Email unique, Role ∈ {Admin, Customer}, IsActive |
| `RefreshTokens` | Phiên đăng nhập (hash SHA-256) | TokenHash unique, RevokedAt |
| `FieldTypes` | Loại sân | Name unique |
| `Fields` | Sân | Name unique, Status ∈ {Active, Maintenance, Inactive} |
| `TimeSlots` | Khung giờ theo loại sân | EndTime > StartTime, unique (loại, giờ) |
| `Prices` | Giá sân × khung giờ × loại ngày | unique (FieldId, TimeSlotId, DayType) |
| `FieldClosures` | Ngày sân nghỉ/bảo trì | unique (FieldId, ClosedDate) |
| `Bookings` | Đơn đặt sân | **UX_Bookings_ActiveSlot** (FieldId, TimeSlotId, BookingDate) WHERE Status ≠ Cancelled |
| `NewsPosts` | Bài tin tức | Status ∈ {Draft, Published} |
| `PartnerItems` | Thẻ đối tác trang khách | IsActive, SortOrder |

---

## 4. Danh sách API (`/api/v1`)

| Nhóm | Method & path | Quyền |
|---|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` | Public / Login |
| Hồ sơ | `GET·PATCH /users/me`, `PATCH /users/me/password` | Login |
| Người dùng | `GET·POST /users`, `PATCH /users/:id` | Admin |
| Loại sân | `GET /field-types` · `POST`, `PATCH /:id`, `DELETE /:id` | Public · Admin |
| Sân | `GET /fields`, `GET /fields/:id` · `POST`, `PATCH /:id`, `DELETE /:id` | Public · Admin |
| Khung giờ | `GET /time-slots?fieldTypeId=` · `POST`, `PATCH /:id`, `DELETE /:id` | Public · Admin |
| Giá | `GET /fields/:fieldId/prices` · `PUT /fields/:fieldId/prices` | Public · Admin |
| Ngày nghỉ | `GET·POST /fields/:fieldId/closures`, `DELETE /fields/:fieldId/closures/:id` | Admin |
| Lịch sân | `GET /fields/:fieldId/schedule?date=`, `GET /schedule?fieldTypeId=&date=` | Public |
| Đơn đặt | `POST /bookings`, `GET /bookings/me`, `GET /bookings/:id`, `POST /bookings/:id/payment`, `PATCH /bookings/:id/cancel` | Customer |
| Đơn (Admin) | `GET /bookings`, `PATCH /bookings/:id/status` | Admin |
| Thống kê | `GET /stats/overview`, `GET /stats/revenue?groupBy=day\|month`, `GET /stats/fields` | Admin |
| Tin tức | `GET /news-posts`, `GET /news-posts/:id` · `POST`, `PATCH /:id`, `DELETE /:id` | Public · Admin |
| Đối tác | `GET /partner-items`, `GET /partner-items/:id` · `POST`, `PATCH /:id`, `DELETE /:id` | Public · Admin |
| Hệ thống | `GET /health` | Public |

---

## 5. Nhiệm vụ cần thực hiện (theo kế hoạch đề cương)

### Giai đoạn 2 – Thiết kế hệ thống (20/09 – 04/10) — **100%**
- ✅ Phân tích yêu cầu từ đề cương, chốt kiến trúc, công nghệ
- ✅ Thiết kế CSDL `database/migrations/001_init_schema.sql`, mở rộng `002_site_content.sql`
- ✅ Dữ liệu mẫu `database/seeds/001_master_data.sql`, `002`, `003_admin_profile.sql`
- ✅ Rules cho AI `.cursor/rules/` + file `STRUCTURE.md`
- ✅ Tài liệu Chương 2 báo cáo: `reportChap2.md` (use case, ERD Mermaid, luồng đặt sân / thanh toán / hủy, kiến trúc)

### Giai đoạn 3 – Backend, RESTful API, CSDL (05/10 – 25/10) — **100%**
- ✅ `config/env.js`, `config/logger.js`, `package.json`, `.env.example`
- ✅ `config/database.js` (pool, transaction)
- ✅ `constants/*`, `utils/*`, `middlewares/*`
- ✅ `app.js`, `server.js`, `routes/index.js`, `/health`
- ✅ `scripts/migrate.js`, `scripts/seed.js` → chạy được `npm run db:migrate && npm run db:seed`
- ✅ Module `auth` (đăng ký, đăng nhập, refresh token xoay vòng, đăng xuất)
- ✅ Module `fieldTypes` (CRUD cơ bản)
- ✅ Module `users` (hồ sơ, đổi mật khẩu, Admin quản lý + khóa tài khoản)
- ✅ Module `timeSlots` (chống chồng lấn), `fields` (upload ảnh, tìm kiếm/lọc)
- ✅ Module `prices`, `fieldClosures`
- ✅ Module `schedule` (lịch 1 sân, bảng nhiều sân)
- ✅ Module `bookings` (BR05–BR14) + job `expirePendingBookings`
- ✅ Module `stats` (BR15–BR16), `newsPosts`, `partnerItems`
- ✅ Test: `tests/unit/booking.service.test.js`, `newsPost.service.test.js`; integration `bookings.test.js` (409 trùng slot, hủy đơn; cần DB đã seed)
- ✅ `npm run lint` sạch lỗi (backend)

### Giai đoạn 4 – Giao diện khách hàng (26/10 – 15/11)
- ✅ Cài thư viện, `app/`, `api/httpClient.js`, `tokenStore.js`, `AuthContext`, `ProtectedRoute`
- ✅ Chép font/ảnh từ `template/` sang `src/assets/`, CSS trang trong `styles/pages/` (homepage, booking, news, customer/partners, contact, login, register)
- ✅ Header, Footer, ClientLayout, AuthLayout, `main.jsx`, router lazy load, `npm run build` OK
- ✅ Trang chủ, Đặt lịch (phiếu + bảng trạng thái), Tin tức, Đối tác (`customer.html`), Liên hệ — theo `template/webpages`
- ✅ Đăng nhập, Đăng ký (RHF + Zod, gọi API; giao diện template)
- ✅ Tìm kiếm/lọc sân (`/search`); chi tiết sân + lịch theo ngày gộp trong luồng đặt sân
- ✅ Đặt sân (form API + bảng trạng thái `/schedule`), thanh toán mô phỏng (`/payment/:id`)
- ✅ Lịch sử đặt sân + hủy đơn, Hồ sơ cá nhân + đổi mật khẩu

### Giai đoạn 5 – Quản trị & thống kê (16/11 – 29/11)
- ✅ `AdminLayout` + sidebar (`/admin`, role Admin), `admin.css`
- ✅ Section 1: CRUD tin tức & đối tác (`newsPosts`, `partnerItems`, migration `002`); trang Tin tức / Đối tác đọc API
- ✅ Section 2: đơn đặt lịch (lọc, duyệt, hủy, hoàn thành), cập nhật trạng thái sân, workflow trạng thái đơn
- 🟡 Dashboard tổng quan (số đơn chờ, doanh thu tổng); biểu đồ doanh thu / hiệu suất sân chưa có UI
- ⬜ Quản lý người dùng, loại sân, khung giờ, bảng giá, upload ảnh sân đầy đủ trên admin

### Giai đoạn 6 – Tích hợp, kiểm thử, hoàn thiện (30/11 – 13/12)
- ⬜ Postman collection đủ các nhóm API + test script lưu token/id
- ⬜ `docs/test-cases.md`: tìm kiếm/lọc, đặt trùng khung giờ, hủy quá hạn, độ chính xác thống kê
- ⬜ Kiểm thử đặt trùng đồng thời (2 request cùng lúc → 1 thành công, 1 lỗi 409)
- ⬜ Kiểm tra responsive, sửa lỗi, cập nhật README hướng dẫn chạy
