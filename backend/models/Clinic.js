// backend/models/Clinic.js
const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  password: { type: String, required: true },
  specialization: { type: String, required: true },
  clinicId: { type: String, required: true },
  licensePhoto: { type: String, required: true },
  profilePic: { type: String },
  address: { type: String, required: true }
});

module.exports = mongoose.model('Clinic', clinicSchema);
