const mongoose = require('mongoose');

const legalSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    unique: true, // 'terms', 'privacy'
  },
  content: {
    type: String,
    required: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model('LegalContent', legalSchema);
