const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  questionAsked: { 
    type: String, 
    required: true 
  },
  answerByAI: { 
    type: String, 
    required: true 
  },
  timeOfQuestionAsked: { 
    type: Date, 
    default: Date.now 
  },
  timeOfResponseByAI: { 
    type: Date, 
    default: Date.now 
  },
  timeOfResponseByClinic: { 
    type: Date 
  },
  specialization: { 
    type: String, 
    default: null 
  },
  isEmergency: { 
    type: Boolean, 
    default: false 
  },
  verificationType: { 
    type: String, 
    enum: ["correct", "incorrect", "Unverified"], 
    default: "Unverified" 
  },
  verifiedByClinic: {
    fullName: { type: String },
    specialization: { type: String },
    clinicId: { type: String }
  },
  correctedResponseByClinic: { 
    type: String 
  }
});

module.exports = mongoose.model('Chat', chatSchema);
