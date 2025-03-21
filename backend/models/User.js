const mongoose = require('mongoose');
const Chat = require('./Chat'); // Import Chat model to embed its schema

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  chats: [Chat.schema] // Embed all chats asked by the user
});

module.exports = mongoose.model('User', userSchema);
