-- Nội dung tin tức & đối tác (quản trị Section 1)

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
