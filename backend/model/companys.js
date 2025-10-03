const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  website: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Company || mongoose.model('Company', CompanySchema);
