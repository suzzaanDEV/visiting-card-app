const crypto = require('crypto');

const hashValue = (value) => crypto.createHash('sha256').update(value).digest('hex');

const generateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return { otp, hash: hashValue(otp) };
};

const generateResetToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  return { token, hash: hashValue(token) };
};

module.exports = {
  hashValue,
  generateOtp,
  generateResetToken
};

