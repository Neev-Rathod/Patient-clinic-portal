// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pass: { type: String, required: true },
  chats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }]
});

module.exports = mongoose.model('User', userSchema);
