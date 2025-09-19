const mongoose = require('mongoose');

const TranscriptSchema = new mongoose.Schema({
  sessionId: String,
  transcript: [String],
});

module.exports = mongoose.model('Transcript', TranscriptSchema);
