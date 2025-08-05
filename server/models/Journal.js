const mongoose = require('mongoose');

const JournalSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    moodLabel: String,
    moodScore: Number,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Journal', JournalSchema);
