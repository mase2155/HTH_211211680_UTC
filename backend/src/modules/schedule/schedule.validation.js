const { z } = require('zod');
const { dateSchema, idSchema } = require('../../utils/commonSchemas');

const fieldScheduleQuery = z.object({
  date: dateSchema,
});

const boardQuery = z.object({
  fieldTypeId: idSchema,
  date: dateSchema,
});

module.exports = { fieldScheduleQuery, boardQuery };
