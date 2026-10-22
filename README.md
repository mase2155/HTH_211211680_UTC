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

## Báo cáo thiết kế (Chương 2)

Xem `reportChap2.md` hoặc **`reportChap2.docx`** (Word) — phân tích yêu cầu, use case, ERD, kiến trúc và luồng nghiệp vụ.

