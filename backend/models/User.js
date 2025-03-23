const mongoose = require('mongoose');
const Chat = require('./Chat');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // New field
  password: { type: String, required: true },
  chats: [Chat.schema]
});

module.exports = mongoose.model('User', userSchema);
