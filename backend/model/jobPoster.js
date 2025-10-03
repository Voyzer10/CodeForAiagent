const mongoose = require('mongoose');

const JobPosterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.JobPoster || mongoose.model('JobPoster', JobPosterSchema);
