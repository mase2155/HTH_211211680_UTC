# Website đặt sân thể thao trực tuyến

Đồ án cử nhân CNTT — Hà Thế Hưng (211211680).

Công nghệ: ReactJS + Vite, Node.js + Express.js, SQL Server, REST API

## Chạy nhanh

```powershell
cd backend
copy .env.example .env   # chỉnh DB_* và JWT_ACCESS_SECRET
npm install
npm run db:migrate
npm run db:seed
npm run dev

cd ../frontend
npm install
npm run dev
```

Backend test (cần CSDL đã migrate/seed): `cd backend && npm test`

## Cấu trúc

Xem file `STRUCTURE.md` (cây thư mục, nhiệm vụ từng thành phần, tiến độ).
Quy tắc code cho AI nằm trong `.cursor/rules/`.

## Báo cáo (theo chương đồ án)

| Chương | File | Nội dung |
|--------|------|----------|
| 2 — Thiết kế | `reportChap2.md` / `reportChap2.docx` | Use case, ERD, luồng nghiệp vụ |
| 4 — Giao diện & luồng chính | `reportChap4.md` / `reportChap4.docx` | React, component, đặt sân / thanh toán / hủy / admin |
| 3 — Backend | **`reportChap3.md`** | Cài đặt API, CSDL, workflow code (mức intern) |

