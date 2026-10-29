# Website đặt sân thể thao trực tuyến

Đồ án cử nhân CNTT — Hà Thế Hưng (211211680).

Công nghệ: ReactJS + Vite, Node.js + Express.js, SQL Server, REST API

## Chạy nhanh

```powershell
cd backend
copy .env.example .env   # chỉnh DB_*, JWT_ACCESS_SECRET, ADMIN_EMAIL / ADMIN_PASSWORD
npm install
npm run db:migrate
npm run db:seed
npm run dev

cd ../frontend
copy .env.example .env   # tùy chọn; mặc định proxy Vite → backend
npm install
npm run dev
```

- Frontend: http://localhost:5173  
- API: http://localhost:5000/api/v1  
- Admin: đăng nhập bằng tài khoản tạo từ `ADMIN_*` trong `backend/.env` (sau `db:seed`), vào `/admin`

Kiểm thử backend (cần CSDL đã migrate/seed):

```powershell
cd backend
npm test
npm run lint
```

Build frontend: `cd frontend && npm run build`

## Postman

1. Import `postman/SportBooking.postman_environment.json` và `postman/SportBooking.postman_collection.json`.
2. Sửa biến môi trường: `adminPassword`, `customerEmail` (hoặc register mới), `fieldId`, `timeSlotId`, `bookingDate`.
3. Chạy **Auth → Login admin** hoặc **Login customer** để lưu `accessToken`.

Tạo lại collection sau khi sửa script: `node postman/scripts/generate-collection.js`

## Kịch bản kiểm thử

Xem `docs/test-cases.md` (tìm kiếm, 409 trùng slot, hủy đơn, thống kê).

## Cấu trúc

Xem `STRUCTURE.md` (cây thư mục, API, tiến độ). Quy tắc code cho AI: `.cursor/rules/`.

## Báo cáo (theo chương đồ án)

| Chương | File | Nội dung |
|--------|------|----------|
| 2 — Thiết kế | `reportChap2.md` / `reportChap2.docx` | Use case, ERD, luồng nghiệp vụ |
| 3 — Backend | `reportChap3.md` | Cài đặt API, CSDL, workflow code |
| 4 — Giao diện | `reportChap4.md` / `reportChap4.docx` | React, đặt sân / thanh toán / admin |
