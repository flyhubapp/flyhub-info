const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['buyer', 'seller'],
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  // Buyer specific
  address: String,
  // Seller specific
  company: String,
  location: String,
  businessType: String,
  productCategory: String,
  website: String,
  taxId: String,
  yearsInBusiness: String,
  status: {
    type: String,
    default: 'New'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Registration', registrationSchema);
