const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Clinic = require('../models/Clinic');
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
router.post('/send', verifyUser, async (req, res) => {
  const { text } = req.body;
  try {
    // Call Gemini API using the correct format
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text }] }]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    let aiResponseText = 'AI is currently unavailable. Please try again later.';
    if (geminiResponse.data &&
        geminiResponse.data.candidates &&
        geminiResponse.data.candidates[0] &&
        geminiResponse.data.candidates[0].content &&
        geminiResponse.data.candidates[0].content.parts) {
      aiResponseText = geminiResponse.data.candidates[0].content.parts[0].text;
    }

    // Create a new Chat document with the new structure
    const chat = new Chat({
      userId: req.userId,
      questionAsked: text,
      answerByAI: aiResponseText,
      // timeOfQuestionAsked and timeOfResponseByAI are set automatically
      specialization: null,
      isEmergency: false,
      verificationType: "Unverified"
    });
    await chat.save();

    // Also, embed this chat into the user's chats array
    await User.findByIdAndUpdate(req.userId, { $push: { chats: chat } });

    res.json(chat);
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error communicating with AI service' });
  }
});

// Endpoint for clinic to review/update a chat response
router.put('/review/:chatId', verifyClinic, async (req, res) => {
  const { chatId } = req.params;
  const { updatedText, verificationType } = req.body; // Clinic provides corrected text and verification type
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    // Get clinic details
    const clinic = await Clinic.findById(req.clinicId);
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });

    // Update chat fields
    chat.correctedResponseByClinic = updatedText;
    chat.verificationType = verificationType; // Expected to be one of "correct" or "incorrect"
    chat.timeOfResponseByClinic = new Date();
    chat.verifiedByClinic = {
      fullName: clinic.fullName,
      specialization: clinic.specialization,
      clinicId: clinic.clinicId
    };

    await chat.save();

    // Also, embed this chat into the clinic's chats array and update statistics
    clinic.chats.push(chat);
    clinic.numberOfResolved += 1;
    clinic.numberOfTotalPrompts += 1;
    // Optionally update the number of emergency prompts if applicable
    if (chat.isEmergency) {
      clinic.numberOfEmergencyPrompts += 1;
    }
    // Increase number of questions (if you want to track each reviewed prompt)
    clinic.numberOfQuestions += 1;

    await clinic.save();

    res.json({ message: 'Chat updated and verified', chat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
