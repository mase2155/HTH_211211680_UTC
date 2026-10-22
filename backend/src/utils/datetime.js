const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const config = require('../config/env');
const { DAY_TYPE } = require('../constants/booking');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

const DATE_FORMAT = 'YYYY-MM-DD';
const TIME_FORMAT = 'HH:mm';
const MS_PER_MINUTE = 60 * 1000;

const now = () => dayjs().tz(config.timezone);

// Ngày hiện tại theo giờ Việt Nam, dạng YYYY-MM-DD
const today = () => now().format(DATE_FORMAT);

const isValidDate = (value) => dayjs(value, DATE_FORMAT, true).isValid();

// Cộng/trừ ngày trên chuỗi YYYY-MM-DD (không phụ thuộc múi giờ)
const addDays = (dateString, days) =>
  dayjs(dateString, DATE_FORMAT).add(days, 'day').format(DATE_FORMAT);

// BR03: Thứ 7, Chủ nhật tính là Weekend
const getDayType = (dateString) => {
  const weekday = dayjs(dateString, DATE_FORMAT).day();
  return weekday === 0 || weekday === 6 ? DAY_TYPE.WEEKEND : DAY_TYPE.WEEKDAY;
};

// Thời điểm bắt đầu của ngày + giờ (giờ Việt Nam)
const toMoment = (dateString, timeString) =>
  dayjs.tz(`${dateString} ${timeString}`, `${DATE_FORMAT} ${TIME_FORMAT}`, config.timezone);

const minutesUntil = (dateString, timeString, reference = new Date()) =>
  (toMoment(dateString, timeString).valueOf() - reference.getTime()) / MS_PER_MINUTE;

// BR05, BR13: khung giờ đã bắt đầu hay chưa
const hasStarted = (dateString, timeString, reference = new Date()) =>
  minutesUntil(dateString, timeString, reference) <= 0;

// BR12: còn đủ thời gian tối thiểu trước giờ bắt đầu để hủy
const isCancellable = (dateString, timeString, beforeMinutes, reference = new Date()) =>
  minutesUntil(dateString, timeString, reference) >= beforeMinutes;

const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * MS_PER_MINUTE);

module.exports = {
  DATE_FORMAT,
  TIME_FORMAT,
  now,
  today,
  isValidDate,
  addDays,
  getDayType,
  minutesUntil,
  hasStarted,
  isCancellable,
  addMinutes,
};
