# Kịch bản kiểm thử (Chương 5)

Môi trường: backend `http://localhost:5000/api/v1`, frontend Vite `http://localhost:5173`, CSDL đã `db:migrate` + `db:seed`.

## 1. Tìm kiếm và lọc sân

| ID | Bước | Kết quả mong đợi |
|----|------|------------------|
| TC-SEARCH-01 | Mở `/search`, không nhập gì, bấm Tìm | Danh sách sân Active từ seed |
| TC-SEARCH-02 | Nhập từ khóa trùng tên một sân, Tìm | Chỉ sân khớp tên |
| TC-SEARCH-03 | Chọn loại sân + ngày chơi, Tìm | API lọc theo `fieldTypeId` và `bookingDate` |
| TC-SEARCH-04 | Từ khóa không khớp sân nào | Thông báo không tìm thấy |

## 2. Đặt trùng khung giờ (409)

| ID | Bước | Kết quả mong đợi |
|----|------|------------------|
| TC-BOOK-409-01 | Khách A đặt sân X, khung Y, ngày Z thành công | HTTP 201, đơn Pending/Unpaid |
| TC-BOOK-409-02 | Khách B đặt cùng sân, khung, ngày Z | HTTP 409, mã `SLOT_ALREADY_BOOKED` |
| TC-BOOK-409-03 | Chạy `npm test` integration `bookings.test.js` | Test tuần tự và `Promise.all` đều pass |

## 3. Hủy đơn và quá hạn

| ID | Bước | Kết quả mong đợi |
|----|------|------------------|
| TC-CANCEL-01 | Khách hủy đơn Pending trước giờ bắt đầu đủ `BOOKING_CANCEL_BEFORE_MINUTES` | Trạng thái Cancelled |
| TC-CANCEL-02 | Khách hủy đơn Confirmed quá sát giờ bắt đầu | HTTP 409 / không cho hủy |
| TC-HOLD-01 | Đặt Online, không thanh toán quá `BOOKING_HOLD_MINUTES` | Job hệ thống chuyển Cancelled |

## 4. Thống kê doanh thu và số đơn

| ID | Bước | Kết quả mong đợi |
|----|------|------------------|
| TC-STATS-01 | Admin mở `/admin`, xem thẻ tổng quan | `totalBookings`, `cancelledBookings`, `totalRevenue` khớp CSDL |
| TC-STATS-02 | Gọi `GET /stats/revenue?groupBy=day&fromDate&toDate` | Mỗi ngày có `revenue`, `paidBookings`; ngày không có đơn = 0 |
| TC-STATS-03 | Dashboard chọn nhóm theo tháng | Bảng và biểu đồ cập nhật theo kỳ |
| TC-STATS-04 | `GET /stats/fields` | Doanh thu chỉ tính đơn `PaymentStatus = Paid` (BR15) |

## 5. Quản trị (smoke)

| ID | Bước | Kết quả mong đợi |
|----|------|------------------|
| TC-ADMIN-01 | CRUD loại sân, khung giờ | Phản ánh trên lịch đặt sân |
| TC-ADMIN-02 | Thêm ngày nghỉ sân | Ô lịch Maintenance ngày đó |
| TC-ADMIN-03 | Khóa tài khoản khách | Khách không đăng nhập được |
