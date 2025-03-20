// backend/routes/chat.js
const express = require('express');
const axios = require('axios');
const Chat = require('../models/Chat');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware to verify user JWT (for user-specific routes)
const verifyUser = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Failed to authenticate token' });
    req.userId = decoded.id;
    next();
  });
};

// Middleware to verify clinic JWT
const verifyClinic = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Failed to authenticate token' });
    req.clinicId = decoded.id;
    next();
  });
};

// Endpoint for user to send a message to AI (Gemini)
// For simplicity, we assume Gemini API accepts a POST with { prompt: text }
// and returns { response: text }
router.post('/send', verifyUser, async (req, res) => {
  const { text } = req.body;
  try {
    // Call Gemini API using the correct format
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ 
          parts: [{ text: text }] 
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Extract text from Gemini response
    let aiResponseText = 'AI is currently unavailable. Please try again later.';
    
    if (geminiResponse.data && 
        geminiResponse.data.candidates && 
        geminiResponse.data.candidates[0] && 
        geminiResponse.data.candidates[0].content && 
        geminiResponse.data.candidates[0].content.parts) {
      aiResponseText = geminiResponse.data.candidates[0].content.parts[0].text;
    }
    
    // Create a new Chat document
    const chat = new Chat({
      userId: req.userId,
      messages: [
        { sender: 'user', text },
        { sender: 'ai', text: aiResponseText }
      ]
    });
    await chat.save();
    res.json(chat);
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error communicating with AI service' });
  }
});

// Endpoint for clinic to review/update a chat response
router.put('/review/:chatId', verifyClinic, async (req, res) => {
  const { chatId } = req.params;
  const { updatedText } = req.body;
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    
    // Append clinic message
    chat.messages.push({ sender: 'clinic', text: updatedText });
    chat.verified = true;
    chat.reviewedBy = req.clinicId;
    
    await chat.save();
    res.json({ message: 'Chat updated and verified', chat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
