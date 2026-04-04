const mongoose = require('mongoose');

const AppAccessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  companyName: { type: String },
  role: { type: String },
  useCase: { type: String },
  status: { type: String, default: 'New' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AppAccess', AppAccessSchema);
