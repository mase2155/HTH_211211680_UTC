const { z } = require('zod');
const { idParams, dateSchema } = require('../../utils/commonSchemas');

const fieldIdParams = idParams;

const closureIdParams = z.object({
  id: idParams.shape.id,
  closureId: z.coerce.number().int().positive(),
});

const createBody = z.object({
  closedDate: dateSchema,
  reason: z.string().trim().max(255).optional(),
});

module.exports = { fieldIdParams, closureIdParams, createBody };
