-- Xóa sân dư theo tên cũ (đã thay bằng "{Loại} - Sân số 1/2/3").
-- Idempotent: chỉ xóa khi tên khớp danh sách legacy.

DECLARE @LegacyNames TABLE (Name NVARCHAR(150) PRIMARY KEY);
INSERT INTO @LegacyNames (Name) VALUES
    (N'Sân bóng đá số 01'),
    (N'Sân bóng đá số 02'),
    (N'Sân bóng đá số 03'),
    (N'Sân bóng đá số 04'),
    (N'Sân cầu lông số 01'),
    (N'Sân cầu lông số 02'),
    (N'Sân cầu lông số 03'),
    (N'Sân tennis số 01'),
    (N'Sân tennis số 02'),
    (N'Sân pickleball số 01'),
    (N'Sân pickleball số 02');

DELETE b
FROM dbo.Bookings b
INNER JOIN dbo.Fields f ON f.FieldId = b.FieldId
INNER JOIN @LegacyNames ln ON ln.Name = f.Name;

DELETE f
FROM dbo.Fields f
INNER JOIN @LegacyNames ln ON ln.Name = f.Name;
