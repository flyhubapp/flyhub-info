const mongoose = require('mongoose');

const AppVersionSchema = new mongoose.Schema({
  version: { type: String, required: true },
  apkUrl: { type: String, required: true },
  apkFilename: { type: String, required: true },
  releaseNotes: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AppVersion', AppVersionSchema);
