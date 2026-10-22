export const statusBoardRows = [
  {
    time: '06:00 - 07:30',
    fields: ['available', 'booked', 'available', 'maintenance'],
  },
  {
    time: '07:30 - 09:00',
    fields: ['available', 'available', 'booked', 'available'],
  },
  {
    time: '16:00 - 17:30',
    fields: ['booked', 'booked', 'available', 'available'],
  },
  {
    time: '17:30 - 19:00',
    fields: ['booked', 'booked', 'booked', 'booked'],
  },
  {
    time: '19:00 - 20:30',
    fields: ['booked', 'available', 'booked', 'booked'],
  },
  {
    time: '20:30 - 22:00',
    fields: ['available', 'available', 'available', 'available'],
  },
];

export const slotStatusLabel = {
  available: 'Còn trống',
  booked: 'Đã đặt',
  maintenance: 'Bảo trì',
};

export const slotStatusClass = {
  available: 'slot-available',
  booked: 'slot-booked',
  maintenance: 'slot-maintenance',
};
