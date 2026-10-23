-- Gỡ nội dung seed thử có tiền tố [Demo] (nếu đã chạy bản demo trước đó).
DELETE FROM dbo.NewsPosts WHERE Title LIKE N'[Demo]%';
DELETE FROM dbo.PartnerItems WHERE Title LIKE N'[Demo]%';
