function toOffset({ page, limit }) {
  return (page - 1) * limit;
}

function buildMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

module.exports = { toOffset, buildMeta };
