const FIELD_STATUS = Object.freeze({
  ACTIVE: 'Active',
  MAINTENANCE: 'Maintenance',
  INACTIVE: 'Inactive',
});

// Trạng thái một ô trong lịch sân (sân × khung giờ × ngày)
const SLOT_STATE = Object.freeze({
  AVAILABLE: 'Available',
  BOOKED: 'Booked',
  MAINTENANCE: 'Maintenance',
  PAST: 'Past',
});

module.exports = {
  FIELD_STATUS,
  FIELD_STATUS_VALUES: Object.freeze(Object.values(FIELD_STATUS)),
  SLOT_STATE,
};
