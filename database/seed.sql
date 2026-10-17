USE SportBooking;
GO

INSERT INTO dbo.FieldTypes (Name) VALUES
    (N'Bóng đá'),
    (N'Cầu lông'),
    (N'Tennis'),
    (N'Pickleball');

INSERT INTO dbo.TimeSlots (StartTime, EndTime) VALUES
    ('06:00', '07:00'),
    ('07:00', '08:00'),
    ('08:00', '09:00'),
    ('17:00', '18:00'),
    ('18:00', '19:00'),
    ('19:00', '20:00');

-- Tài khoản admin mẫu sẽ được tạo ở giai đoạn auth (cần bcrypt).
-- Sân, giá, đơn đặt sân mẫu sẽ bổ sung khi làm chức năng quản trị.
GO
