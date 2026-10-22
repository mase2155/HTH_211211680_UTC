const AppError = require('../../utils/AppError');
const { ERROR_CODES } = require('../../constants/errorCodes');
const { FIELD_STATUS, SLOT_STATE } = require('../../constants/field');
const { getDayType, hasStarted } = require('../../utils/datetime');
const fieldRepository = require('../fields/field.repository');
const fieldTypeRepository = require('../fieldTypes/fieldType.repository');
const priceRepository = require('../prices/price.repository');
const scheduleRepository = require('./schedule.repository');

function resolveSlotState({ field, date, slot, booked, closed, reference = new Date() }) {
  if (field.status === FIELD_STATUS.MAINTENANCE || closed) return SLOT_STATE.MAINTENANCE;
  if (hasStarted(date, slot.startTime, reference)) return SLOT_STATE.PAST;
  if (booked) return SLOT_STATE.BOOKED;
  return SLOT_STATE.AVAILABLE;
}

async function buildContext(fieldTypeId, date) {
  const fields = await scheduleRepository.getActiveFieldsByType(fieldTypeId);
  const slots = await scheduleRepository.getActiveSlotsByType(fieldTypeId);
  const fieldIds = fields.map((field) => field.id);
  const bookings = await scheduleRepository.getBookingsForDate({ fieldIds, date });
  const closures = await scheduleRepository.getClosuresForDate({ fieldIds, date });
  const bookingSet = new Set(bookings.map((b) => `${b.fieldId}:${b.timeSlotId}`));
  const closureSet = new Set(closures.map((c) => c.fieldId));
  return { fields, slots, bookingSet, closureSet };
}

async function byField(fieldId, date) {
  const field = await fieldRepository.findById(fieldId);
  if (!field) {
    throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Không tìm thấy sân');
  }
  const { slots, bookingSet, closureSet } = await buildContext(field.fieldTypeId, date);
  const dayType = getDayType(date);
  const closed = closureSet.has(fieldId);

  const items = [];
  for (const slot of slots) {
    const amount = await priceRepository.findAmount({ fieldId, timeSlotId: slot.id, dayType });
    const booked = bookingSet.has(`${fieldId}:${slot.id}`);
    items.push({
      timeSlotId: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      amount,
      state: resolveSlotState({
        field,
        date,
        slot,
        booked,
        closed,
      }),
    });
  }

  return { field, date, dayType, slots: items };
}

async function board({ fieldTypeId, date }) {
  const type = await fieldTypeRepository.findById(fieldTypeId);
  if (!type) {
    throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Không tìm thấy loại sân');
  }
  const { fields, slots, bookingSet, closureSet } = await buildContext(fieldTypeId, date);

  const rows = slots.map((slot) => ({
    timeSlotId: slot.id,
    startTime: slot.startTime,
    endTime: slot.endTime,
    fields: fields.map((field) => ({
      fieldId: field.id,
      fieldName: field.name,
      state: resolveSlotState({
        field,
        date,
        slot,
        booked: bookingSet.has(`${field.id}:${slot.id}`),
        closed: closureSet.has(field.id),
      }),
    })),
  }));

  return { fieldType: type, date, rows };
}

module.exports = { byField, board };
