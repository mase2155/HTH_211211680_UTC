-- Dữ liệu mẫu tin tức & đối tác (idempotent theo Title)

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
