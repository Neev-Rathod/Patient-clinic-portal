const mongoose = require('mongoose');
const Chat = require('./Chat');

const clinicSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  password: { type: String, required: true },
  // Specialization will be chosen from the provided 20 types via a select on the frontend.
  specialization: { type: String, required: true },
  clinicId: { type: String, required: true },
  licensePhoto: { type: String, required: true },
  profilePic: { type: String },
  address: { type: String, required: true },
  description: { type: String, required: true },
  numberOfResolved: { type: Number, default: 0 },
  numberOfQuestions: { type: Number, default: 0 },
  numberOfEmergencyPrompts: { type: Number, default: 0 },
  numberOfTotalPrompts: { type: Number, default: 0 },
  chats: [Chat.schema]
});

module.exports = mongoose.model('Clinic', clinicSchema);
