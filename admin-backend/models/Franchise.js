const mongoose = require('mongoose');

const FranchiseSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  location: { type: String, required: true },
  investmentLevel: { type: String },
  background: { type: String },
  status: { type: String, default: 'New' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Franchise', FranchiseSchema);
