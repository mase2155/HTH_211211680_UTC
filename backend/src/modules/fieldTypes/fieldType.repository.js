const { sql, createRequest } = require('../../config/database');
const { toOffset } = require('../../utils/pagination');

const LIST_COLUMNS = `
  FieldTypeId AS id,
  Name AS name,
  Description AS description,
  IsActive AS isActive,
  CONVERT(VARCHAR(23), CreatedAt, 126) AS createdAt
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
    SELECT ${LIST_COLUMNS}, COUNT(*) OVER() AS totalCount
    FROM dbo.FieldTypes
    ${where}
    ORDER BY Name
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `);

  const total = result.recordset[0]?.totalCount ?? 0;
  const items = result.recordset.map(({ totalCount: _total, ...row }) => row);
  return { items, total };
}

async function findById(id, tx) {
  const request = await createRequest(tx);
  const result = await request.input('id', sql.Int, id).query(`
    SELECT ${LIST_COLUMNS}
    FROM dbo.FieldTypes
    WHERE FieldTypeId = @id
  `);
  return result.recordset[0] ?? null;
}

async function insert({ name, description }, tx) {
  const request = await createRequest(tx);
  const result = await request
    .input('name', sql.NVarChar(50), name)
    .input('description', sql.NVarChar(255), description ?? null)
    .query(`
      INSERT INTO dbo.FieldTypes (Name, Description)
      OUTPUT INSERTED.FieldTypeId AS id
      VALUES (@name, @description)
    `);
  return findById(result.recordset[0].id, tx);
}

async function update(id, data, tx) {
  const request = await createRequest(tx);
  request.input('id', sql.Int, id);

  const sets = [];
  if (data.name !== undefined) {
    request.input('name', sql.NVarChar(50), data.name);
    sets.push('Name = @name');
  }
  if (data.description !== undefined) {
    request.input('description', sql.NVarChar(255), data.description);
    sets.push('Description = @description');
  }
  if (data.isActive !== undefined) {
    request.input('isActive', sql.Bit, data.isActive ? 1 : 0);
    sets.push('IsActive = @isActive');
  }
  if (sets.length === 0) return findById(id, tx);

  sets.push('UpdatedAt = SYSUTCDATETIME()');
  await request.query(`UPDATE dbo.FieldTypes SET ${sets.join(', ')} WHERE FieldTypeId = @id`);
  return findById(id, tx);
}

async function remove(id, tx) {
  const request = await createRequest(tx);
  const result = await request.input('id', sql.Int, id).query(`
    DELETE FROM dbo.FieldTypes WHERE FieldTypeId = @id
  `);
  return result.rowsAffected[0] > 0;
}

async function countFieldsUsingType(id, tx) {
  const request = await createRequest(tx);
  const result = await request.input('id', sql.Int, id).query(`
    SELECT COUNT(*) AS cnt FROM dbo.Fields WHERE FieldTypeId = @id
  `);
  return result.recordset[0].cnt;
}

module.exports = { list, findById, insert, update, remove, countFieldsUsingType };
