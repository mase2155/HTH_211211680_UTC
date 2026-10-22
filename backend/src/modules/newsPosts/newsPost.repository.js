const { sql, createRequest } = require('../../config/database');
const { toOffset } = require('../../utils/pagination');

const COLUMNS = `
  NewsPostId AS id,
  Title AS title,
  Excerpt AS excerpt,
  ImageUrl AS imageUrl,
  Status AS status,
  CONVERT(VARCHAR(23), CreatedAt, 126) AS createdAt,
  CONVERT(VARCHAR(23), UpdatedAt, 126) AS updatedAt
`;

async function list({ page, limit, status }, tx) {
  const request = await createRequest(tx);
  request.input('offset', sql.Int, toOffset({ page, limit }));
  request.input('limit', sql.Int, limit);
  let where = 'WHERE 1=1';
  if (status) {
    request.input('status', sql.NVarChar(20), status);
    where += ' AND Status = @status';
  }
  const result = await request.query(`
    SELECT ${COLUMNS}, COUNT(*) OVER() AS totalCount
    FROM dbo.NewsPosts
    ${where}
    ORDER BY UpdatedAt DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `);
  const total = result.recordset[0]?.totalCount ?? 0;
  const items = result.recordset.map(({ totalCount: _t, ...row }) => row);
  return { items, total };
}

async function findById(id, tx) {
  const request = await createRequest(tx);
  const result = await request.input('id', sql.Int, id).query(`
    SELECT ${COLUMNS} FROM dbo.NewsPosts WHERE NewsPostId = @id
  `);
  return result.recordset[0] ?? null;
}

async function insert(data, tx) {
  const request = await createRequest(tx);
  const result = await request
    .input('title', sql.NVarChar(300), data.title)
    .input('excerpt', sql.NVarChar(1000), data.excerpt ?? null)
    .input('imageUrl', sql.NVarChar(500), data.imageUrl ?? null)
    .input('status', sql.NVarChar(20), data.status)
    .query(`
      INSERT INTO dbo.NewsPosts (Title, Excerpt, ImageUrl, Status)
      OUTPUT INSERTED.NewsPostId AS id
      VALUES (@title, @excerpt, @imageUrl, @status)
    `);
  return findById(result.recordset[0].id, tx);
}

async function update(id, data, tx) {
  const request = await createRequest(tx);
  request.input('id', sql.Int, id);
  const sets = [];
  if (data.title !== undefined) {
    request.input('title', sql.NVarChar(300), data.title);
    sets.push('Title = @title');
  }
  if (data.excerpt !== undefined) {
    request.input('excerpt', sql.NVarChar(1000), data.excerpt);
    sets.push('Excerpt = @excerpt');
  }
  if (data.imageUrl !== undefined) {
    request.input('imageUrl', sql.NVarChar(500), data.imageUrl);
    sets.push('ImageUrl = @imageUrl');
  }
  if (data.status !== undefined) {
    request.input('status', sql.NVarChar(20), data.status);
    sets.push('Status = @status');
  }
  if (sets.length === 0) return findById(id, tx);
  sets.push('UpdatedAt = SYSUTCDATETIME()');
  await request.query(`UPDATE dbo.NewsPosts SET ${sets.join(', ')} WHERE NewsPostId = @id`);
  return findById(id, tx);
}

async function remove(id, tx) {
  const request = await createRequest(tx);
  const result = await request.input('id', sql.Int, id).query(`
    DELETE FROM dbo.NewsPosts WHERE NewsPostId = @id
  `);
  return result.rowsAffected[0] > 0;
}

module.exports = { list, findById, insert, update, remove };
