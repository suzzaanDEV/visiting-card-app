const mongoose = require('mongoose');

const PendingRegistrationSchema = new mongoose.Schema({
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    username: { type: String, required: true },
    passwordHash: { type: String, required: true },
    name: { type: String },
    emailVerificationOtpHash: { type: String },
    emailVerificationOtpExpires: { type: Date },
    createdAt: { type: Date, default: Date.now, index: { expireAfterSeconds: 3600 } }, // auto-expire after 1 hour
});

module.exports = mongoose.model('PendingRegistration', PendingRegistrationSchema);
