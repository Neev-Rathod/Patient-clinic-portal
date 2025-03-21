const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Clinic = require('../models/Clinic');
const router = express.Router();

// Register a new clinic
router.post('/register', async (req, res) => {
  const { fullName, password, specialization, clinicId, licensePhoto, profilePic, address } = req.body;
  try {
    const hashedPass = await bcrypt.hash(password, 10);
    const clinic = new Clinic({
      fullName,
      password: hashedPass,
      specialization,
      clinicId,
      licensePhoto,
      profilePic,
      address,
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

// Clinic login
router.post('/login', async (req, res) => {
  const { fullName, password } = req.body;
  try {
    const clinic = await Clinic.findOne({ fullName });
    if (!clinic) return res.status(400).json({ error: 'Clinic not found' });

    const isMatch = await bcrypt.compare(password, clinic.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: clinic._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, clinicId: clinic._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
