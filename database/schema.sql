-- CSDL: đặt sân thể thao trực tuyến
-- Chạy trên SQL Server (SSMS). Điều chỉnh tên database nếu cần.

IF DB_ID(N'SportBooking') IS NULL
BEGIN
    CREATE DATABASE SportBooking;
END
GO

USE SportBooking;
GO

IF OBJECT_ID(N'dbo.Bookings', N'U') IS NOT NULL DROP TABLE dbo.Bookings;
IF OBJECT_ID(N'dbo.Prices', N'U') IS NOT NULL DROP TABLE dbo.Prices;
IF OBJECT_ID(N'dbo.TimeSlots', N'U') IS NOT NULL DROP TABLE dbo.TimeSlots;
IF OBJECT_ID(N'dbo.Fields', N'U') IS NOT NULL DROP TABLE dbo.Fields;
IF OBJECT_ID(N'dbo.FieldTypes', N'U') IS NOT NULL DROP TABLE dbo.FieldTypes;
IF OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL DROP TABLE dbo.Users;
GO

CREATE TABLE dbo.Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Phone NVARCHAR(20) NULL,
    Role NVARCHAR(20) NOT NULL CONSTRAINT CK_Users_Role CHECK (Role IN (N'Admin', N'User')),
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME()
);

CREATE TABLE dbo.FieldTypes (
    FieldTypeId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE dbo.Fields (
    FieldId INT IDENTITY(1,1) PRIMARY KEY,
    FieldTypeId INT NOT NULL CONSTRAINT FK_Fields_FieldTypes REFERENCES dbo.FieldTypes (FieldTypeId),
    Name NVARCHAR(150) NOT NULL,
    Address NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    ImageUrl NVARCHAR(500) NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_Fields_IsActive DEFAULT 1
);

CREATE TABLE dbo.TimeSlots (
    TimeSlotId INT IDENTITY(1,1) PRIMARY KEY,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    CONSTRAINT CK_TimeSlots_Range CHECK (EndTime > StartTime)
);

CREATE TABLE dbo.Prices (
    PriceId INT IDENTITY(1,1) PRIMARY KEY,
    FieldId INT NOT NULL CONSTRAINT FK_Prices_Fields REFERENCES dbo.Fields (FieldId),
    TimeSlotId INT NOT NULL CONSTRAINT FK_Prices_TimeSlots REFERENCES dbo.TimeSlots (TimeSlotId),
    Amount DECIMAL(12, 0) NOT NULL CONSTRAINT CK_Prices_Amount CHECK (Amount >= 0),
    CONSTRAINT UQ_Prices_Field_Slot UNIQUE (FieldId, TimeSlotId)
);

CREATE TABLE dbo.Bookings (
    BookingId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL CONSTRAINT FK_Bookings_Users REFERENCES dbo.Users (UserId),
    FieldId INT NOT NULL CONSTRAINT FK_Bookings_Fields REFERENCES dbo.Fields (FieldId),
    TimeSlotId INT NOT NULL CONSTRAINT FK_Bookings_TimeSlots REFERENCES dbo.TimeSlots (TimeSlotId),
    BookingDate DATE NOT NULL,
    Status NVARCHAR(20) NOT NULL CONSTRAINT CK_Bookings_Status CHECK (Status IN (N'Pending', N'Confirmed', N'Cancelled', N'Completed')),
    PaymentMethod NVARCHAR(20) NOT NULL CONSTRAINT CK_Bookings_Payment CHECK (PaymentMethod IN (N'Simulate', N'PayAtField')),
    TotalAmount DECIMAL(12, 0) NOT NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Bookings_CreatedAt DEFAULT SYSUTCDATETIME()
);

-- Chống đặt trùng: một sân + một khung giờ + một ngày chỉ có một đơn còn hiệu lực
CREATE UNIQUE INDEX UX_Bookings_NoOverlap
    ON dbo.Bookings (FieldId, TimeSlotId, BookingDate)
    WHERE Status IN (N'Pending', N'Confirmed');
GO
