-- Chuẩn hóa: mỗi loại sân (Bóng đá, Cầu lông, Tennis, Pickleball) có đúng 3 sân (số 1–3).
-- Idempotent: thêm sân thiếu, vô hiệu hóa sân bóng đá số 04 cũ nếu còn.

INSERT INTO dbo.Fields (FieldTypeId, Name, Address, Description)
SELECT ft.FieldTypeId, v.Name, v.Address, v.Description
FROM (VALUES
    (N'Bóng đá', N'Bóng đá - Sân số 1', N'45 Cầu Giấy, Nghĩa Đô, Hà Nội', N'Sân 5 người, cỏ nhân tạo thế hệ mới, có đèn chiếu sáng.'),
    (N'Bóng đá', N'Bóng đá - Sân số 2', N'45 Cầu Giấy, Nghĩa Đô, Hà Nội', N'Sân 5 người, có mái che khán đài.'),
    (N'Bóng đá', N'Bóng đá - Sân số 3', N'45 Cầu Giấy, Nghĩa Đô, Hà Nội', N'Sân 7 người, phù hợp giao hữu.'),
    (N'Cầu lông', N'Cầu lông - Sân số 1', N'132 Cầu Giấy, Nghĩa Đô, Hà Nội', N'Thảm tiêu chuẩn BWF, ánh sáng chống chói.'),
    (N'Cầu lông', N'Cầu lông - Sân số 2', N'132 Cầu Giấy, Nghĩa Đô, Hà Nội', N'Thảm tiêu chuẩn BWF.'),
    (N'Cầu lông', N'Cầu lông - Sân số 3', N'132 Cầu Giấy, Nghĩa Đô, Hà Nội', N'Sân trong nhà, có điều hòa.'),
    (N'Tennis', N'Tennis - Sân số 1', N'Khu đô thị An Khánh, Hoài Đức, Hà Nội', N'Mặt sân asphalt nhiều lớp sơn, giảm chấn.'),
    (N'Tennis', N'Tennis - Sân số 2', N'Khu đô thị An Khánh, Hoài Đức, Hà Nội', N'Mặt sân cứng, có đèn đêm.'),
    (N'Tennis', N'Tennis - Sân số 3', N'Khu đô thị An Khánh, Hoài Đức, Hà Nội', N'Sân có mái che một phần.'),
    (N'Pickleball', N'Pickleball - Sân số 1', N'521 Minh Khai, Hai Bà Trưng, Hà Nội', N'Sân trong nhà, mặt sân chống trơn.'),
    (N'Pickleball', N'Pickleball - Sân số 2', N'521 Minh Khai, Hai Bà Trưng, Hà Nội', N'Sân trong nhà, có cho thuê vợt.'),
    (N'Pickleball', N'Pickleball - Sân số 3', N'521 Minh Khai, Hai Bà Trưng, Hà Nội', N'Sân trong nhà, ánh sáng LED.')
) AS v(TypeName, Name, Address, Description)
JOIN dbo.FieldTypes ft ON ft.Name = v.TypeName
WHERE NOT EXISTS (SELECT 1 FROM dbo.Fields f WHERE f.Name = v.Name);

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
WHERE f.Name LIKE N'%- Sân số %'
  AND NOT EXISTS (
    SELECT 1 FROM dbo.Prices p
    WHERE p.FieldId = f.FieldId AND p.TimeSlotId = ts.TimeSlotId AND p.DayType = d.DayType
);
