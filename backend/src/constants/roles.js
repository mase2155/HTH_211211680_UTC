const ROLES = Object.freeze({
  ADMIN: 'Admin',
  CUSTOMER: 'Customer',
});

const ROLE_VALUES = Object.freeze(Object.values(ROLES));

module.exports = { ROLES, ROLE_VALUES };
