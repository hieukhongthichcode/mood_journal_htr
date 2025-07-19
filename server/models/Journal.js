// server/models/Journal.js

const mongoose = require('mongoose');

const JournalSchema = new mongoose.Schema({
  title: String,
  content: String,
  moodLabel: String,   // ví dụ: "POSITIVE", "NEGATIVE"
  moodScore: Number,   // ví dụ: 0.75
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Journal', JournalSchema);
