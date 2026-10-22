export const queryKeys = {
  authMe: ['auth', 'me'],
  fields: (filters) => ['fields', filters],
  fieldDetail: (id) => ['fields', id],
  fieldSchedule: (id, date) => ['fields', id, 'schedule', date],
  bookingsMe: (filters) => ['bookings', 'me', filters],
};
