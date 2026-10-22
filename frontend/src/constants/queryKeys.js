export const queryKeys = {
  authMe: ['auth', 'me'],
  fieldTypes: ['fieldTypes'],
  timeSlots: (fieldTypeId) => ['timeSlots', fieldTypeId],
  fields: (filters) => ['fields', filters],
  fieldDetail: (id) => ['fields', id],
  fieldSchedule: (id, date) => ['fields', id, 'schedule', date],
  scheduleBoard: (fieldTypeId, date) => ['schedule', 'board', fieldTypeId, date],
  bookingsMe: (filters) => ['bookings', 'me', filters],
  bookingDetail: (id) => ['bookings', id],
};
