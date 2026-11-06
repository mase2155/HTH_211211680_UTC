-- =============================================================================
-- SQL_FULL.sql – Gộp toàn bộ script CSDL dự án đặt sân thể thao (SQL Server)
-- Hà Thế Hưng – 211211680 – Website đặt sân trực tuyến
--
-- Mục đích: Một file duy nhất để nộp Git / báo cáo / chạy thủ công trên SSMS.
-- Nguồn sự thật khi phát triển: database/migrations/*.sql và database/seeds/*.sql
-- (npm run db:migrate / npm run db:seed trong thư mục backend).
--
-- Quy ước:
--   - Schema dbo, bảng PascalCase số nhiều, PK <Entity>Id INT IDENTITY.
--   - Chuỗi tiếng Việt: NVARCHAR + N'...'. Tiền VND: DECIMAL(12,0).
--   - Thời điểm hệ thống: DATETIME2(0) UTC (SYSUTCDATETIME()).
--   - BookingDate / StartTime / EndTime: theo giờ Việt Nam (Asia/Ho_Chi_Minh).
--   - Tài khoản Admin: KHÔNG có trong SQL; seed.js tạo bcrypt từ .env.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PHẦN 0: Bảng theo dõi migration (tạo tự động bởi backend/scripts/migrate.js)
-- -----------------------------------------------------------------------------
IF OBJECT_ID(N'dbo.SchemaMigrations', N'U') IS NULL
CREATE TABLE dbo.SchemaMigrations (
    Name      NVARCHAR(200) NOT NULL CONSTRAINT PK_SchemaMigrations PRIMARY KEY,
    Checksum  CHAR(64) NOT NULL,
    AppliedAt DATETIME2(0) NOT NULL CONSTRAINT DF_SchemaMigrations_AppliedAt DEFAULT SYSUTCDATETIME()
);
GO

-- -----------------------------------------------------------------------------
-- PHẦN 1: MIGRATION 001_init_schema.sql – 10 bảng nghiệp vụ cốt lõi
-- -----------------------------------------------------------------------------
CREATE TABLE dbo.Users (
    UserId        INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Users PRIMARY KEY,
    FullName      NVARCHAR(100) NOT NULL,
    Email         NVARCHAR(150) NOT NULL CONSTRAINT UQ_Users_Email UNIQUE,
    PasswordHash  NVARCHAR(255) NOT NULL,
    Phone         VARCHAR(20) NULL,
    Role          NVARCHAR(20) NOT NULL CONSTRAINT DF_Users_Role DEFAULT N'Customer',
    IsActive      BIT NOT NULL CONSTRAINT DF_Users_IsActive DEFAULT 1,
    CreatedAt     DATETIME2(0) NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt     DATETIME2(0) NOT NULL CONSTRAINT DF_Users_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_Users_Role CHECK (Role IN (N'Admin', N'Customer'))
);

CREATE TABLE dbo.RefreshTokens (
    RefreshTokenId BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_RefreshTokens PRIMARY KEY,
    UserId         INT NOT NULL CONSTRAINT FK_RefreshTokens_Users REFERENCES dbo.Users (UserId) ON DELETE CASCADE,
    TokenHash      CHAR(64) NOT NULL CONSTRAINT UQ_RefreshTokens_TokenHash UNIQUE,
    ExpiresAt      DATETIME2(0) NOT NULL,
    RevokedAt      DATETIME2(0) NULL,
    CreatedAt      DATETIME2(0) NOT NULL CONSTRAINT DF_RefreshTokens_CreatedAt DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_RefreshTokens_UserId ON dbo.RefreshTokens (UserId);

CREATE TABLE dbo.FieldTypes (
    FieldTypeId  INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_FieldTypes PRIMARY KEY,
    Name         NVARCHAR(50) NOT NULL CONSTRAINT UQ_FieldTypes_Name UNIQUE,
    Description  NVARCHAR(255) NULL,
    IsActive     BIT NOT NULL CONSTRAINT DF_FieldTypes_IsActive DEFAULT 1,
    CreatedAt    DATETIME2(0) NOT NULL CONSTRAINT DF_FieldTypes_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt    DATETIME2(0) NOT NULL CONSTRAINT DF_FieldTypes_UpdatedAt DEFAULT SYSUTCDATETIME()
);

CREATE TABLE dbo.Fields (
    FieldId      INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Fields PRIMARY KEY,
    FieldTypeId  INT NOT NULL CONSTRAINT FK_Fields_FieldTypes REFERENCES dbo.FieldTypes (FieldTypeId),
    Name         NVARCHAR(150) NOT NULL CONSTRAINT UQ_Fields_Name UNIQUE,
    Address      NVARCHAR(255) NOT NULL,
    Description  NVARCHAR(2000) NULL,
    ImageUrl     NVARCHAR(500) NULL,
    Status       NVARCHAR(20) NOT NULL CONSTRAINT DF_Fields_Status DEFAULT N'Active',
    CreatedAt    DATETIME2(0) NOT NULL CONSTRAINT DF_Fields_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt    DATETIME2(0) NOT NULL CONSTRAINT DF_Fields_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_Fields_Status CHECK (Status IN (N'Active', N'Maintenance', N'Inactive'))
);
CREATE INDEX IX_Fields_FieldTypeId ON dbo.Fields (FieldTypeId);

CREATE TABLE dbo.TimeSlots (
    TimeSlotId   INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_TimeSlots PRIMARY KEY,
    FieldTypeId  INT NOT NULL CONSTRAINT FK_TimeSlots_FieldTypes REFERENCES dbo.FieldTypes (FieldTypeId),
    StartTime    TIME(0) NOT NULL,
    EndTime      TIME(0) NOT NULL,
    IsActive     BIT NOT NULL CONSTRAINT DF_TimeSlots_IsActive DEFAULT 1,
    CreatedAt    DATETIME2(0) NOT NULL CONSTRAINT DF_TimeSlots_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt    DATETIME2(0) NOT NULL CONSTRAINT DF_TimeSlots_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_TimeSlots_Range CHECK (EndTime > StartTime),
    CONSTRAINT UQ_TimeSlots_Type_Range UNIQUE (FieldTypeId, StartTime, EndTime)
);

CREATE TABLE dbo.Prices (
    PriceId     INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Prices PRIMARY KEY,
    FieldId     INT NOT NULL CONSTRAINT FK_Prices_Fields REFERENCES dbo.Fields (FieldId) ON DELETE CASCADE,
    TimeSlotId  INT NOT NULL CONSTRAINT FK_Prices_TimeSlots REFERENCES dbo.TimeSlots (TimeSlotId) ON DELETE CASCADE,
    DayType     NVARCHAR(10) NOT NULL,
    Amount      DECIMAL(12, 0) NOT NULL,
    UpdatedAt   DATETIME2(0) NOT NULL CONSTRAINT DF_Prices_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_Prices_DayType CHECK (DayType IN (N'Weekday', N'Weekend')),
    CONSTRAINT CK_Prices_Amount CHECK (Amount >= 0),
    CONSTRAINT UQ_Prices_Field_Slot_Day UNIQUE (FieldId, TimeSlotId, DayType)
);

CREATE TABLE dbo.FieldClosures (
    FieldClosureId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_FieldClosures PRIMARY KEY,
    FieldId        INT NOT NULL CONSTRAINT FK_FieldClosures_Fields REFERENCES dbo.Fields (FieldId) ON DELETE CASCADE,
    ClosedDate     DATE NOT NULL,
    Reason         NVARCHAR(255) NULL,
    CreatedAt      DATETIME2(0) NOT NULL CONSTRAINT DF_FieldClosures_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_FieldClosures_Field_Date UNIQUE (FieldId, ClosedDate)
);

CREATE TABLE dbo.Bookings (
    BookingId      INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Bookings PRIMARY KEY,
    BookingCode    VARCHAR(20) NOT NULL CONSTRAINT UQ_Bookings_Code UNIQUE,
    UserId         INT NOT NULL CONSTRAINT FK_Bookings_Users REFERENCES dbo.Users (UserId),
    FieldId        INT NOT NULL CONSTRAINT FK_Bookings_Fields REFERENCES dbo.Fields (FieldId),
    TimeSlotId     INT NOT NULL CONSTRAINT FK_Bookings_TimeSlots REFERENCES dbo.TimeSlots (TimeSlotId),
    BookingDate    DATE NOT NULL,
    StartTime      TIME(0) NOT NULL,
    EndTime        TIME(0) NOT NULL,
    CustomerName   NVARCHAR(100) NOT NULL,
    CustomerPhone  VARCHAR(20) NOT NULL,
    Note           NVARCHAR(500) NULL,
    TotalAmount    DECIMAL(12, 0) NOT NULL,
    Status         NVARCHAR(20) NOT NULL CONSTRAINT DF_Bookings_Status DEFAULT N'Pending',
    PaymentMethod  NVARCHAR(20) NOT NULL,
    PaymentStatus  NVARCHAR(20) NOT NULL CONSTRAINT DF_Bookings_PaymentStatus DEFAULT N'Unpaid',
    PaidAt         DATETIME2(0) NULL,
    HoldExpiresAt  DATETIME2(0) NULL,
    CancelledAt    DATETIME2(0) NULL,
    CancelReason   NVARCHAR(255) NULL,
    CreatedAt      DATETIME2(0) NOT NULL CONSTRAINT DF_Bookings_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt      DATETIME2(0) NOT NULL CONSTRAINT DF_Bookings_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_Bookings_Status CHECK (Status IN (N'Pending', N'Confirmed', N'Completed', N'Cancelled')),
    CONSTRAINT CK_Bookings_PaymentMethod CHECK (PaymentMethod IN (N'Online', N'PayAtField')),
    CONSTRAINT CK_Bookings_PaymentStatus CHECK (PaymentStatus IN (N'Unpaid', N'Paid', N'Refunded')),
    CONSTRAINT CK_Bookings_TotalAmount CHECK (TotalAmount >= 0)
);

CREATE UNIQUE INDEX UX_Bookings_ActiveSlot
    ON dbo.Bookings (FieldId, TimeSlotId, BookingDate)
    WHERE Status <> N'Cancelled';

CREATE INDEX IX_Bookings_UserId_CreatedAt ON dbo.Bookings (UserId, CreatedAt DESC);
CREATE INDEX IX_Bookings_BookingDate ON dbo.Bookings (BookingDate)
    INCLUDE (FieldId, Status, PaymentStatus, TotalAmount);
CREATE INDEX IX_Bookings_HoldExpiresAt ON dbo.Bookings (HoldExpiresAt)
    WHERE HoldExpiresAt IS NOT NULL;
GO

-- -----------------------------------------------------------------------------
-- PHẦN 2: MIGRATION 002_site_content.sql – Tin tức & đối tác
-- -----------------------------------------------------------------------------
CREATE TABLE dbo.NewsPosts (
    NewsPostId   INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_NewsPosts PRIMARY KEY,
    Title        NVARCHAR(300) NOT NULL,
    Excerpt      NVARCHAR(1000) NULL,
    ImageUrl     NVARCHAR(500) NULL,
    Status       NVARCHAR(20) NOT NULL CONSTRAINT DF_NewsPosts_Status DEFAULT N'Draft',
    CreatedAt    DATETIME2(0) NOT NULL CONSTRAINT DF_NewsPosts_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt    DATETIME2(0) NOT NULL CONSTRAINT DF_NewsPosts_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_NewsPosts_Status CHECK (Status IN (N'Draft', N'Published'))
);

CREATE INDEX IX_NewsPosts_Status_UpdatedAt ON dbo.NewsPosts (Status, UpdatedAt DESC);

CREATE TABLE dbo.PartnerItems (
    PartnerItemId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_PartnerItems PRIMARY KEY,
    Title         NVARCHAR(300) NOT NULL,
    ImageUrl      NVARCHAR(500) NULL,
    IsFeatured    BIT NOT NULL CONSTRAINT DF_PartnerItems_IsFeatured DEFAULT 0,
    SortOrder     INT NOT NULL CONSTRAINT DF_PartnerItems_SortOrder DEFAULT 0,
    IsActive      BIT NOT NULL CONSTRAINT DF_PartnerItems_IsActive DEFAULT 1,
    CreatedAt     DATETIME2(0) NOT NULL CONSTRAINT DF_PartnerItems_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt     DATETIME2(0) NOT NULL CONSTRAINT DF_PartnerItems_UpdatedAt DEFAULT SYSUTCDATETIME()
);

CREATE INDEX IX_PartnerItems_Active_Sort ON dbo.PartnerItems (IsActive, SortOrder, PartnerItemId);
GO

-- -----------------------------------------------------------------------------
-- PHẦN 3: MIGRATION 007_renumber_field_ids.sql – Reseed FieldId 1..N (nếu cần)
-- Chỉ chạy khi MAX(FieldId) > COUNT(*) (có lỗ hổng ID sau xóa sân).
-- -----------------------------------------------------------------------------
SET XACT_ABORT ON;

IF (SELECT ISNULL(MAX(FieldId), 0) FROM dbo.Fields) <= (SELECT COUNT(*) FROM dbo.Fields)
BEGIN
    PRINT N'Bỏ qua 007: FieldId đã liên tục.';
END
ELSE
BEGIN
    BEGIN TRANSACTION;

    DECLARE @map TABLE (OldId INT NOT NULL PRIMARY KEY, NewId INT NOT NULL);

    INSERT INTO @map (OldId, NewId)
    SELECT FieldId, ROW_NUMBER() OVER (ORDER BY FieldId)
    FROM dbo.Fields;

    DECLARE @fieldsBackup TABLE (
        NewId INT NOT NULL,
        FieldTypeId INT NOT NULL,
        Name NVARCHAR(150) NOT NULL,
        Address NVARCHAR(255) NOT NULL,
        Description NVARCHAR(2000) NULL,
        ImageUrl NVARCHAR(500) NULL,
        Status NVARCHAR(20) NOT NULL,
        CreatedAt DATETIME2(0) NOT NULL,
        UpdatedAt DATETIME2(0) NOT NULL
    );

    INSERT INTO @fieldsBackup
    SELECT m.NewId, f.FieldTypeId, f.Name, f.Address, f.Description, f.ImageUrl, f.Status, f.CreatedAt, f.UpdatedAt
    FROM dbo.Fields f
    INNER JOIN @map m ON f.FieldId = m.OldId;

    DECLARE @pricesBackup TABLE (
        NewFieldId INT NOT NULL,
        TimeSlotId INT NOT NULL,
        DayType NVARCHAR(10) NOT NULL,
        Amount DECIMAL(12, 0) NOT NULL
    );

    INSERT INTO @pricesBackup (NewFieldId, TimeSlotId, DayType, Amount)
    SELECT m.NewId, p.TimeSlotId, p.DayType, p.Amount
    FROM dbo.Prices p
    INNER JOIN @map m ON p.FieldId = m.OldId;

    DECLARE @closuresBackup TABLE (
        NewFieldId INT NOT NULL,
        ClosedDate DATE NOT NULL,
        Reason NVARCHAR(500) NULL
    );

    INSERT INTO @closuresBackup (NewFieldId, ClosedDate, Reason)
    SELECT m.NewId, fc.ClosedDate, fc.Reason
    FROM dbo.FieldClosures fc
    INNER JOIN @map m ON fc.FieldId = m.OldId;

    ALTER TABLE dbo.Bookings NOCHECK CONSTRAINT FK_Bookings_Fields;

    UPDATE bk
    SET FieldId = m.NewId
    FROM dbo.Bookings bk
    INNER JOIN @map m ON bk.FieldId = m.OldId;

    DELETE FROM dbo.Fields;

    SET IDENTITY_INSERT dbo.Fields ON;

    INSERT INTO dbo.Fields (FieldId, FieldTypeId, Name, Address, Description, ImageUrl, Status, CreatedAt, UpdatedAt)
    SELECT NewId, FieldTypeId, Name, Address, Description, ImageUrl, Status, CreatedAt, UpdatedAt
    FROM @fieldsBackup;

    SET IDENTITY_INSERT dbo.Fields OFF;

    INSERT INTO dbo.Prices (FieldId, TimeSlotId, DayType, Amount)
    SELECT NewFieldId, TimeSlotId, DayType, Amount
    FROM @pricesBackup;

    INSERT INTO dbo.FieldClosures (FieldId, ClosedDate, Reason)
    SELECT NewFieldId, ClosedDate, Reason
    FROM @closuresBackup;

    DECLARE @maxId INT = (SELECT ISNULL(MAX(FieldId), 0) FROM dbo.Fields);
    DBCC CHECKIDENT ('dbo.Fields', RESEED, @maxId);

    ALTER TABLE dbo.Bookings WITH CHECK CHECK CONSTRAINT FK_Bookings_Fields;

    COMMIT;
END;
GO

-- -----------------------------------------------------------------------------
-- PHẦN 4: SEED 001_master_data.sql – Loại sân, khung giờ, sân, giá
-- -----------------------------------------------------------------------------
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
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Prices p
    WHERE p.FieldId = f.FieldId AND p.TimeSlotId = ts.TimeSlotId AND p.DayType = d.DayType
);
GO

-- -----------------------------------------------------------------------------
-- PHẦN 5: SEED 002_site_content.sql – Tin tức & đối tác mẫu
-- -----------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.NewsPosts WHERE Title = N'Trạm Cầu Lông Station Badminton – Cụm 9 sân cầu lông hot nhất Cầu Giấy')
INSERT INTO dbo.NewsPosts (Title, Excerpt, ImageUrl, Status)
VALUES (
  N'Trạm Cầu Lông Station Badminton – Cụm 9 sân cầu lông hot nhất Cầu Giấy',
  N'Nếu bạn đang tìm một địa điểm chơi cầu lông sang xịn mịn tại khu vực Cầu Giấy, Trạm Cầu Lông Station Badminton là một cái tên đáng để trải nghiệm.',
  N'/news/badminton.png',
  N'Published'
);

IF NOT EXISTS (SELECT 1 FROM dbo.NewsPosts WHERE Title = N'Sân bóng Nguyên Dương - 45 Đường Cầu Giấy')
INSERT INTO dbo.NewsPosts (Title, Excerpt, ImageUrl, Status)
VALUES (
  N'Sân bóng Nguyên Dương - 45 Đường Cầu Giấy',
  N'Một sân đá bóng trực thuộc phường Nghĩa Đô trú tại số 45 Cầu Giấy cực kì sang xịn mịn với cảnh quan đẹp cùng chất lượng mặt cỏ tốt.',
  N'/news/football.webp',
  N'Published'
);

IF NOT EXISTS (SELECT 1 FROM dbo.NewsPosts WHERE Title = N'Cụm sân tập luyện Ông Mập Pickleball - Sân 521 Minh Khai')
INSERT INTO dbo.NewsPosts (Title, Excerpt, ImageUrl, Status)
VALUES (
  N'Cụm sân tập luyện Ông Mập Pickleball - Sân 521 Minh Khai',
  N'Địa điểm chơi Pickleball trong nhà tại khu vực Minh Khai, Hà Nội — lựa chọn đáng tham khảo.',
  N'/news/pickleball.png',
  N'Published'
);

IF NOT EXISTS (SELECT 1 FROM dbo.NewsPosts WHERE Title = N'Cụm 5 sân hot nhất khu đô thị An Khánh - Win Win Tennis')
INSERT INTO dbo.NewsPosts (Title, Excerpt, ImageUrl, Status)
VALUES (
  N'Cụm 5 sân hot nhất khu đô thị An Khánh - Win Win Tennis',
  N'Mặt sân asphalt nhiều lớp sơn, giảm chấn; màu xanh dương mát mẻ, dễ theo dõi bóng.',
  N'/news/tennis.jpg',
  N'Published'
);

IF NOT EXISTS (SELECT 1 FROM dbo.PartnerItems WHERE Title = N'Trạm Cầu Lông Station Badminton - Cụm 9 sân cầu lông hot nhất Cầu Giấy')
INSERT INTO dbo.PartnerItems (Title, ImageUrl, IsFeatured, SortOrder, IsActive)
VALUES (N'Trạm Cầu Lông Station Badminton - Cụm 9 sân cầu lông hot nhất Cầu Giấy', N'/news/badminton.png', 1, 1, 1);

IF NOT EXISTS (SELECT 1 FROM dbo.PartnerItems WHERE Title = N'Sân bóng Nguyên Dương - 45 Đường Cầu Giấy')
INSERT INTO dbo.PartnerItems (Title, ImageUrl, IsFeatured, SortOrder, IsActive)
VALUES (N'Sân bóng Nguyên Dương - 45 Đường Cầu Giấy', N'/news/football.webp', 1, 2, 1);

IF NOT EXISTS (SELECT 1 FROM dbo.PartnerItems WHERE Title = N'Cụm sân tập luyện Ông Mập Pickleball - Sân 521 Minh Khai')
INSERT INTO dbo.PartnerItems (Title, ImageUrl, IsFeatured, SortOrder, IsActive)
VALUES (N'Cụm sân tập luyện Ông Mập Pickleball - Sân 521 Minh Khai', N'/news/pickleball.png', 1, 3, 1);

IF NOT EXISTS (SELECT 1 FROM dbo.PartnerItems WHERE Title = N'Cụm 5 sân hot nhất khu đô thị An Khánh - Win Win Tennis')
INSERT INTO dbo.PartnerItems (Title, ImageUrl, IsFeatured, SortOrder, IsActive)
VALUES (N'Cụm 5 sân hot nhất khu đô thị An Khánh - Win Win Tennis', N'/news/tennis.jpg', 0, 4, 1);

IF NOT EXISTS (SELECT 1 FROM dbo.NewsPosts WHERE Title = N'Sân thể thao đa năng ALOBO Hub - Thanh Xuân')
INSERT INTO dbo.NewsPosts (Title, Excerpt, ImageUrl, Status)
VALUES (
  N'Sân thể thao đa năng ALOBO Hub - Thanh Xuân',
  N'Cụm sân đa môn tại Thanh Xuân — minh họa thêm bài tin mà không cần xóa bài cũ; trang Tin tức tự hiển thị thêm khối nội dung.',
  N'/news/football.webp',
  N'Published'
);

IF NOT EXISTS (SELECT 1 FROM dbo.PartnerItems WHERE Title = N'ALOBO Hub - Đa môn thể thao Thanh Xuân')
INSERT INTO dbo.PartnerItems (Title, ImageUrl, IsFeatured, SortOrder, IsActive)
VALUES (N'ALOBO Hub - Đa môn thể thao Thanh Xuân', N'/news/pickleball.png', 0, 5, 1);
GO

-- -----------------------------------------------------------------------------
-- PHẦN 6: SEED 003_admin_profile.sql – Hồ sơ Admin (sau khi seed.js tạo user)
-- -----------------------------------------------------------------------------
UPDATE dbo.Users
SET FullName = N'Hà Thế Hưng',
    Phone = N'0818269203',
    Email = N'hathehung260923@gmail.com',
    UpdatedAt = SYSUTCDATETIME()
WHERE UserId = (
  SELECT TOP 1 UserId FROM dbo.Users WHERE Role = N'Admin' ORDER BY UserId
);
GO

-- -----------------------------------------------------------------------------
-- PHẦN 7: SEED 004_fields_three_per_type.sql – Bổ sung sân thiếu + giá
-- -----------------------------------------------------------------------------
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
GO

-- -----------------------------------------------------------------------------
-- PHẦN 8: SEED 005_remove_legacy_field_names.sql – Xóa tên sân cũ
-- -----------------------------------------------------------------------------
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
GO

-- -----------------------------------------------------------------------------
-- PHẦN 9: SEED 006_remove_demo_prefix_content.sql
-- -----------------------------------------------------------------------------
DELETE FROM dbo.NewsPosts WHERE Title LIKE N'[Demo]%';
DELETE FROM dbo.PartnerItems WHERE Title LIKE N'[Demo]%';
GO

-- =============================================================================
-- PHẦN 10: Tham khảo cú pháp truy vấn (backend repository – SQL Server)
-- =============================================================================
/*
-- Tạo database (migrate.js chạy trên master):
IF DB_ID(N'TenDatabase') IS NULL CREATE DATABASE [TenDatabase];

-- Phân trang + tổng số bản ghi:
SELECT col1, col2, COUNT(*) OVER() AS totalCount
FROM dbo.Bookings
ORDER BY CreatedAt DESC
OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;

-- Alias camelCase cho API:
SELECT f.FieldId AS id,
       CONVERT(VARCHAR(10), b.BookingDate, 23) AS bookingDate,
       CONVERT(VARCHAR(5), b.StartTime, 108) AS startTime
FROM dbo.Bookings b
JOIN dbo.Fields f ON f.FieldId = b.FieldId;

-- INSERT tham số hóa (mssql driver – ví dụ ý nghĩa):
INSERT INTO dbo.Bookings (BookingCode, UserId, FieldId, TimeSlotId, BookingDate, ...)
VALUES (@bookingCode, @userId, @fieldId, @timeSlotId, @bookingDate, ...);

-- UPDATE có UpdatedAt:
UPDATE dbo.Users SET FullName = @fullName, UpdatedAt = SYSUTCDATETIME() WHERE UserId = @userId;

-- Transaction (ứng dụng dùng withTransaction):
BEGIN TRANSACTION;
-- ... nhiều câu lệnh ...
COMMIT;

-- Unique filtered index (chống đặt trùng slot):
CREATE UNIQUE INDEX UX_Bookings_ActiveSlot
    ON dbo.Bookings (FieldId, TimeSlotId, BookingDate)
    WHERE Status <> N'Cancelled';

-- IDENTITY_INSERT khi gán FieldId thủ công:
SET IDENTITY_INSERT dbo.Fields ON;
INSERT INTO dbo.Fields (FieldId, ...) VALUES (...);
SET IDENTITY_INSERT dbo.Fields OFF;
DBCC CHECKIDENT ('dbo.Fields', RESEED, @maxId);
*/

-- =============================================================================
-- Danh sách bảng (12 + SchemaMigrations)
-- =============================================================================
-- Users, RefreshTokens, FieldTypes, Fields, TimeSlots, Prices, FieldClosures,
-- Bookings, NewsPosts, PartnerItems, SchemaMigrations
--
-- Enum (CHECK constraint):
--   Role: Admin | Customer
--   Field Status: Active | Maintenance | Inactive
--   DayType: Weekday | Weekend
--   Booking Status: Pending | Confirmed | Completed | Cancelled
--   PaymentMethod: Online | PayAtField
--   PaymentStatus: Unpaid | Paid | Refunded
--   NewsPosts Status: Draft | Published
-- =============================================================================
