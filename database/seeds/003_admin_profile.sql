-- Đồng bộ hồ sơ Admin (đồ án) — idempotent
UPDATE dbo.Users
SET FullName = N'Hà Thế Hưng',
    Phone = N'0818269203',
    Email = N'hathehung260923@gmail.com',
    UpdatedAt = SYSUTCDATETIME()
WHERE UserId = (
  SELECT TOP 1 UserId FROM dbo.Users WHERE Role = N'Admin' ORDER BY UserId
);
