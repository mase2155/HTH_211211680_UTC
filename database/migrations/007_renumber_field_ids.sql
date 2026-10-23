-- Đánh lại FieldId liên tục 1..N (theo thứ tự FieldId cũ), reseed IDENTITY.

SET XACT_ABORT ON;

IF (SELECT ISNULL(MAX(FieldId), 0) FROM dbo.Fields) <= (SELECT COUNT(*) FROM dbo.Fields)
BEGIN
    RETURN;
END;

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
