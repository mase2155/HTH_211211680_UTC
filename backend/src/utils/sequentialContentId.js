const { sql, createRequest } = require('../config/database');

const TABLE_CONFIG = Object.freeze({
  partnerItems: { table: 'dbo.PartnerItems', idColumn: 'PartnerItemId' },
  newsPosts: { table: 'dbo.NewsPosts', idColumn: 'NewsPostId' },
  fields: { table: 'dbo.Fields', idColumn: 'FieldId' },
});

async function nextContentIdByCount(tableKey, tx) {
  const { table } = TABLE_CONFIG[tableKey];
  const request = await createRequest(tx);
  const result = await request.query(`SELECT COUNT(*) AS cnt FROM ${table}`);
  return result.recordset[0].cnt + 1;
}

async function reseedContentIdentity(tableKey, tx) {
  const { table, idColumn } = TABLE_CONFIG[tableKey];
  const request = await createRequest(tx);
  await request.query(`
    DECLARE @max INT = (SELECT ISNULL(MAX(${idColumn}), 0) FROM ${table});
    DBCC CHECKIDENT ('${table}', RESEED, @max);
  `);
}

module.exports = { nextContentIdByCount, reseedContentIdentity, TABLE_CONFIG };
