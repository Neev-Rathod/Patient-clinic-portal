const mongoose = require('mongoose');
const Chat = require('./Chat'); // Import Chat model to embed its schema

const clinicSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  password: { type: String, required: true },
  specialization: { type: String, required: true },
  clinicId: { type: String, required: true },
  licensePhoto: { type: String, required: true },
  profilePic: { type: String },
  address: { type: String, required: true },
  numberOfResolved: { type: Number, default: 0 },
  numberOfQuestions: { type: Number, default: 0 },
  numberOfEmergencyPrompts: { type: Number, default: 0 },
  numberOfTotalPrompts: { type: Number, default: 0 },
  chats: [Chat.schema]  // Embed chats resolved by the clinic
});

module.exports = mongoose.model('Clinic', clinicSchema);
