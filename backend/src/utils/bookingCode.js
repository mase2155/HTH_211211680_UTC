const crypto = require('crypto');
const { today } = require('./datetime');

function generateBookingCode() {
  const suffix = crypto.randomInt(1000, 9999);
  return `BK${today().replace(/-/g, '')}${suffix}`;
}

module.exports = { generateBookingCode };
