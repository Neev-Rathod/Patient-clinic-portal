const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const marked = require('marked'); // Import the marked library to convert markdown to HTML
const Chat = require('../models/Chat');
const User = require('../models/User');
const Clinic = require('../models/Clinic');
const router = express.Router();

// Middleware to verify user JWT
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

// Helper function to call Gemini API with a given prompt
const callGeminiAPI = async (prompt) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { 'Content-Type': 'application/json' } }
    );
    if (
      response.data &&
      response.data.candidates &&
      response.data.candidates[0] &&
      response.data.candidates[0].content &&
      response.data.candidates[0].content.parts
    ) {
      return response.data.candidates[0].content.parts[0].text.trim();
    }
    return null;
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    return null;
  }
};

// POST /chat/send – Create a new chat (using three Gemini API calls)
router.post('/send', verifyUser, async (req, res) => {
  const { text, isEmergency } = req.body; // now accepts isEmergency from the client
  try {
    // 1. Get the AI's answer for the user's question.
    const aiResponseTextRaw = await callGeminiAPI(text) || 'AI is currently unavailable. Please try again later.';
    
    // Convert markdown (e.g., **bold**) to HTML using marked
    const aiResponseText = marked.parseInline(aiResponseTextRaw);

    // 2. Ask AI to determine the specialization.
    const specializationPrompt = `This is the question: "${text}" what should be the type of doctor we should go among Dermatologist, General, Cardiologist, Gastroenterologist, Orthopedic Surgeon, Neurologist, Psychiatrist/Psychologist, ENT Specialist (Otolaryngologist), Ophthalmologist, Pulmonologist, Endocrinologist, Urologist, Gynecologist (OB/GYN), Pediatrician, Dentist, Oncologist, Rheumatologist, Allergist/Immunologist, Infectious Disease Specialist, Physiotherapist. Provide in one word.`;
    const specializationResponse = await callGeminiAPI(specializationPrompt);
    const specialization = specializationResponse || "General";

    // 3. Ask AI to generate a chat title in about 5 words.
    const titlePrompt = `For this message: "${aiResponseText}" what should be the title for this message in about 5 words? just give me the title nothing else`;
    const chatName = await callGeminiAPI(titlePrompt) || 'Chat';

    // Create a new Chat document with the received values.
    const chat = new Chat({
      userId: req.userId,
      chatName,
      questionAsked: text,
      answerByAI: aiResponseText, // Store the formatted response
      specialization,
      isEmergency: isEmergency || false, // use the flag from the client (default false)
      verificationType: "Unverified"
    });
    await chat.save();

    // Also embed this chat into the user's chats array.
    await User.findByIdAndUpdate(req.userId, { $push: { chats: chat } });

    res.json(chat);
  } catch (error) {
    console.error('Error in /send endpoint:', error.message);
    res.status(500).json({ error: 'Error communicating with AI service' });
  }
});

// GET /chat/user – Fetch all chats for the authenticated user
router.get('/user', verifyUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /chat/clinic/chats – Fetch chats for the authenticated clinic based on its specialization
router.get('/clinic/chats', verifyClinic, async (req, res) => {
  try {
    // Fetch the clinic profile using req.clinicId.
    const clinic = await Clinic.findById(req.clinicId);
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });
    
    const specialization = clinic.specialization;
    const chats = await Chat.find({ specialization });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /chat/review/:chatId – Endpoint for clinic to review/update a chat response
router.put('/review/:chatId', verifyClinic, async (req, res) => {
  const { chatId } = req.params;
  const { updatedText, verificationType } = req.body;
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    const clinic = await Clinic.findById(req.clinicId);
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });

    // Update the chat with clinic review details
    chat.correctedResponseByClinic = updatedText;
    chat.verificationType = verificationType; // "correct" or "incorrect"
    chat.timeOfResponseByClinic = new Date();
    chat.verifiedByClinic = {
      fullName: clinic.fullName,
      specialization: clinic.specialization,
      clinicId: clinic.clinicId,
      description: clinic.description,
      profilePic: clinic.profilePic
    };

    await chat.save();

    // Update the chat embedded in the clinic's chats array
    clinic.chats.push(chat);
    clinic.numberOfResolved += 1;
    clinic.numberOfTotalPrompts += 1;
    if (chat.isEmergency) {
      clinic.numberOfEmergencyPrompts += 1;
    }
    clinic.numberOfQuestions += 1;
    await clinic.save();

    // Update the corresponding chat embedded in the user's document
    await User.findOneAndUpdate(
      { _id: chat.userId, "chats._id": chat._id },
      { $set: { "chats.$": chat } }
    );

    res.json({ message: 'Chat updated and verified', chat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
