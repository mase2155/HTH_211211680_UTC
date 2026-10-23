const { sql, createRequest } = require('../../config/database');
const { toOffset } = require('../../utils/pagination');
const { nextContentIdByCount, reseedContentIdentity } = require('../../utils/sequentialContentId');

const COLUMNS = `
  PartnerItemId AS id,
  Title AS title,
  ImageUrl AS imageUrl,
  IsFeatured AS isFeatured,
  SortOrder AS sortOrder,
  IsActive AS isActive,
  CONVERT(VARCHAR(23), CreatedAt, 126) AS createdAt,
  CONVERT(VARCHAR(23), UpdatedAt, 126) AS updatedAt
`;

async function list({ page, limit, isActive }, tx) {
  const request = await createRequest(tx);
  request.input('offset', sql.Int, toOffset({ page, limit }));
  request.input('limit', sql.Int, limit);
  let where = 'WHERE 1=1';
  if (isActive !== undefined) {
    request.input('isActive', sql.Bit, isActive ? 1 : 0);
    where += ' AND IsActive = @isActive';
  }
  const result = await request.query(`
    SELECT ${COLUMNS}, COUNT(*) OVER() AS totalCount
    FROM dbo.PartnerItems
    ${where}
    ORDER BY PartnerItemId ASC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `);
  const total = result.recordset[0]?.totalCount ?? 0;
  const items = result.recordset.map(({ totalCount: _t, ...row }) => row);
  return { items, total };
}

async function findById(id, tx) {
  const request = await createRequest(tx);
  const result = await request.input('id', sql.Int, id).query(`
    SELECT ${COLUMNS} FROM dbo.PartnerItems WHERE PartnerItemId = @id
  `);
  return result.recordset[0] ?? null;
}

async function insert(data, tx) {
  const nextId = await nextContentIdByCount('partnerItems', tx);
  const request = await createRequest(tx);
  await request
    .input('id', sql.Int, nextId)
    .input('title', sql.NVarChar(300), data.title)
    .input('imageUrl', sql.NVarChar(500), data.imageUrl ?? null)
    .input('isFeatured', sql.Bit, data.isFeatured ? 1 : 0)
    .input('sortOrder', sql.Int, data.sortOrder)
    .input('isActive', sql.Bit, data.isActive ? 1 : 0)
    .query(`
      SET IDENTITY_INSERT dbo.PartnerItems ON;
      INSERT INTO dbo.PartnerItems (PartnerItemId, Title, ImageUrl, IsFeatured, SortOrder, IsActive)
      VALUES (@id, @title, @imageUrl, @isFeatured, @sortOrder, @isActive);
      SET IDENTITY_INSERT dbo.PartnerItems OFF;
    `);
  await reseedContentIdentity('partnerItems', tx);
  return findById(nextId, tx);
}

async function update(id, data, tx) {
  const request = await createRequest(tx);
  request.input('id', sql.Int, id);
  const sets = [];
  if (data.title !== undefined) {
    request.input('title', sql.NVarChar(300), data.title);
    sets.push('Title = @title');
  }
  if (data.imageUrl !== undefined) {
    request.input('imageUrl', sql.NVarChar(500), data.imageUrl);
    sets.push('ImageUrl = @imageUrl');
  }
  if (data.isFeatured !== undefined) {
    request.input('isFeatured', sql.Bit, data.isFeatured ? 1 : 0);
    sets.push('IsFeatured = @isFeatured');
  }
  if (data.sortOrder !== undefined) {
    request.input('sortOrder', sql.Int, data.sortOrder);
    sets.push('SortOrder = @sortOrder');
  }
  if (data.isActive !== undefined) {
    request.input('isActive', sql.Bit, data.isActive ? 1 : 0);
    sets.push('IsActive = @isActive');
  }
  if (sets.length === 0) return findById(id, tx);
  sets.push('UpdatedAt = SYSUTCDATETIME()');
  await request.query(`UPDATE dbo.PartnerItems SET ${sets.join(', ')} WHERE PartnerItemId = @id`);
  return findById(id, tx);
}

async function remove(id, tx) {
  const request = await createRequest(tx);
  const result = await request.input('id', sql.Int, id).query(`
    DELETE FROM dbo.PartnerItems WHERE PartnerItemId = @id
  `);
  return result.rowsAffected[0] > 0;
}

module.exports = { list, findById, insert, update, remove };
