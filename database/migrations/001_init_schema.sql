-- =============================================================
-- 001_init_schema.sql
-- Khởi tạo CSDL website đặt sân thể thao trực tuyến (SQL Server)
-- Chạy bằng: cd backend && npm run db:migrate
-- Quy ước: mọi thời điểm (CreatedAt, ExpiresAt, ...) lưu theo UTC;
--          BookingDate / StartTime / EndTime lưu theo giờ Việt Nam.
-- =============================================================

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

-- Khung giờ hoạt động dùng chung cho các sân cùng loại
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

-- Giá thuê theo sân + khung giờ + loại ngày (ngày thường / cuối tuần)
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

-- Ngày sân tạm đóng cửa / bảo trì
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

-- Chống đặt trùng: 1 sân + 1 khung giờ + 1 ngày chỉ có 1 đơn chưa bị hủy
CREATE UNIQUE INDEX UX_Bookings_ActiveSlot
    ON dbo.Bookings (FieldId, TimeSlotId, BookingDate)
    WHERE Status <> N'Cancelled';

CREATE INDEX IX_Bookings_UserId_CreatedAt ON dbo.Bookings (UserId, CreatedAt DESC);
CREATE INDEX IX_Bookings_BookingDate ON dbo.Bookings (BookingDate)
    INCLUDE (FieldId, Status, PaymentStatus, TotalAmount);
CREATE INDEX IX_Bookings_HoldExpiresAt ON dbo.Bookings (HoldExpiresAt)
    WHERE HoldExpiresAt IS NOT NULL;
