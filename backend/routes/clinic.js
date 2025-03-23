const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Clinic = require('../models/Clinic');
const router = express.Router();

// Clinic registration route
router.post('/register', async (req, res) => {
  const { fullName, email, password, specialization, clinicId, licensePhoto, profilePic, address, description } = req.body;
  try {
    // Check if email is already registered
    const existingClinic = await Clinic.findOne({ email });
    if(existingClinic) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPass = await bcrypt.hash(password, 10);
    const clinic = new Clinic({
      fullName,
      email,
      password: hashedPass,
      specialization,
      clinicId,
      licensePhoto,
      profilePic,
      address,
      description,
      numberOfResolved: 0,
      numberOfQuestions: 0,
      numberOfEmergencyPrompts: 0,
      numberOfTotalPrompts: 0,
      chats: []
    });
    await clinic.save();
    res.json({ message: 'Clinic registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clinic login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const clinic = await Clinic.findOne({ email });
    if (!clinic) return res.status(400).json({ error: 'Clinic not found' });

    const isMatch = await bcrypt.compare(password, clinic.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: clinic._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, clinicId: clinic._id, profile: clinic });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

// GET clinic profile endpoint
router.get('/profile', verifyClinic, async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.clinicId);
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });
    res.json(clinic);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
