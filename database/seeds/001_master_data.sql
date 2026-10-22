-- =============================================================
-- 001_master_data.sql – Dữ liệu mẫu (idempotent, chạy lại không bị trùng)
-- Chạy bằng: cd backend && npm run db:seed
-- Tài khoản Admin được tạo bởi scripts/seed.js (mật khẩu băm bằng bcrypt).
-- =============================================================

INSERT INTO dbo.FieldTypes (Name, Description)
SELECT v.Name, v.Description
FROM (VALUES
    (N'Bóng đá',    N'Sân bóng đá cỏ nhân tạo 5 - 7 người'),
    (N'Cầu lông',   N'Sân cầu lông trong nhà tiêu chuẩn thi đấu'),
    (N'Tennis',     N'Sân tennis mặt cứng'),
    (N'Pickleball', N'Sân pickleball trong nhà')
) AS v(Name, Description)
WHERE NOT EXISTS (SELECT 1 FROM dbo.FieldTypes ft WHERE ft.Name = v.Name);

INSERT INTO dbo.TimeSlots (FieldTypeId, StartTime, EndTime)
SELECT ft.FieldTypeId, CAST(v.StartTime AS TIME(0)), CAST(v.EndTime AS TIME(0))
FROM (VALUES
    (N'Bóng đá', '06:00', '07:30'), (N'Bóng đá', '07:30', '09:00'),
    (N'Bóng đá', '16:00', '17:30'), (N'Bóng đá', '17:30', '19:00'),
    (N'Bóng đá', '19:00', '20:30'), (N'Bóng đá', '20:30', '22:00'),
    (N'Cầu lông', '06:00', '07:00'), (N'Cầu lông', '07:00', '08:00'),
    (N'Cầu lông', '08:00', '09:00'), (N'Cầu lông', '17:00', '18:00'),
    (N'Cầu lông', '18:00', '19:00'), (N'Cầu lông', '19:00', '20:00'),
    (N'Cầu lông', '20:00', '21:00'), (N'Cầu lông', '21:00', '22:00'),
    (N'Tennis', '06:00', '07:00'), (N'Tennis', '07:00', '08:00'),
    (N'Tennis', '16:00', '17:00'), (N'Tennis', '17:00', '18:00'),
    (N'Tennis', '18:00', '19:00'), (N'Tennis', '19:00', '20:00'),
    (N'Pickleball', '06:00', '07:00'), (N'Pickleball', '07:00', '08:00'),
    (N'Pickleball', '17:00', '18:00'), (N'Pickleball', '18:00', '19:00'),
    (N'Pickleball', '19:00', '20:00'), (N'Pickleball', '20:00', '21:00')
) AS v(TypeName, StartTime, EndTime)
JOIN dbo.FieldTypes ft ON ft.Name = v.TypeName
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.TimeSlots t
    WHERE t.FieldTypeId = ft.FieldTypeId
      AND t.StartTime = CAST(v.StartTime AS TIME(0))
      AND t.EndTime = CAST(v.EndTime AS TIME(0))
);

INSERT INTO dbo.Fields (FieldTypeId, Name, Address, Description)
SELECT ft.FieldTypeId, v.Name, v.Address, v.Description
FROM (VALUES
    (N'Bóng đá', N'Sân bóng đá số 01', N'45 Cầu Giấy, Nghĩa Đô, Hà Nội', N'Sân 5 người, cỏ nhân tạo thế hệ mới, có đèn chiếu sáng.'),
    (N'Bóng đá', N'Sân bóng đá số 02', N'45 Cầu Giấy, Nghĩa Đô, Hà Nội', N'Sân 5 người, có mái che khán đài.'),
    (N'Bóng đá', N'Sân bóng đá số 03', N'45 Cầu Giấy, Nghĩa Đô, Hà Nội', N'Sân 7 người, phù hợp giao hữu.'),
    (N'Bóng đá', N'Sân bóng đá số 04', N'45 Cầu Giấy, Nghĩa Đô, Hà Nội', N'Sân 7 người, có phòng thay đồ.'),
    (N'Cầu lông', N'Sân cầu lông số 01', N'132 Cầu Giấy, Nghĩa Đô, Hà Nội', N'Thảm tiêu chuẩn BWF, ánh sáng chống chói.'),
    (N'Cầu lông', N'Sân cầu lông số 02', N'132 Cầu Giấy, Nghĩa Đô, Hà Nội', N'Thảm tiêu chuẩn BWF.'),
    (N'Cầu lông', N'Sân cầu lông số 03', N'132 Cầu Giấy, Nghĩa Đô, Hà Nội', N'Sân trong nhà, có điều hòa.'),
    (N'Tennis', N'Sân tennis số 01', N'Khu đô thị An Khánh, Hoài Đức, Hà Nội', N'Mặt sân asphalt nhiều lớp sơn, giảm chấn.'),
    (N'Tennis', N'Sân tennis số 02', N'Khu đô thị An Khánh, Hoài Đức, Hà Nội', N'Mặt sân cứng, có đèn đêm.'),
    (N'Pickleball', N'Sân pickleball số 01', N'521 Minh Khai, Hai Bà Trưng, Hà Nội', N'Sân trong nhà, mặt sân chống trơn.'),
    (N'Pickleball', N'Sân pickleball số 02', N'521 Minh Khai, Hai Bà Trưng, Hà Nội', N'Sân trong nhà, có cho thuê vợt.')
) AS v(TypeName, Name, Address, Description)
JOIN dbo.FieldTypes ft ON ft.Name = v.TypeName
WHERE NOT EXISTS (SELECT 1 FROM dbo.Fields f WHERE f.Name = v.Name);

-- Giá: giờ vàng (17:00 - 21:00) x1.5, cuối tuần cộng thêm phụ phí
INSERT INTO dbo.Prices (FieldId, TimeSlotId, DayType, Amount)
SELECT f.FieldId, ts.TimeSlotId, d.DayType,
       CAST(bp.BasePrice
            * (CASE WHEN ts.StartTime >= '17:00' AND ts.StartTime < '21:00' THEN 1.5 ELSE 1 END)
            + (CASE WHEN d.DayType = N'Weekend' THEN bp.WeekendExtra ELSE 0 END) AS DECIMAL(12, 0))
FROM dbo.Fields f
JOIN dbo.FieldTypes ft ON ft.FieldTypeId = f.FieldTypeId
JOIN (VALUES
    (N'Bóng đá', 300000, 50000),
    (N'Cầu lông', 80000, 20000),
    (N'Tennis', 150000, 50000),
    (N'Pickleball', 120000, 30000)
) AS bp(TypeName, BasePrice, WeekendExtra) ON bp.TypeName = ft.Name
JOIN dbo.TimeSlots ts ON ts.FieldTypeId = f.FieldTypeId
CROSS JOIN (VALUES (N'Weekday'), (N'Weekend')) AS d(DayType)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Prices p
    WHERE p.FieldId = f.FieldId AND p.TimeSlotId = ts.TimeSlotId AND p.DayType = d.DayType
);
