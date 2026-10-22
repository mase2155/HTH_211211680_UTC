const bcrypt = require('bcrypt');

const BCRYPT_ROUNDS = 12;

const hashPassword = (plain) => bcrypt.hash(plain, BCRYPT_ROUNDS);

const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);

module.exports = { hashPassword, comparePassword };
