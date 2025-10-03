const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  salary: { type: String },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  posterId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPoster', required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'open' }, // open, closed, etc.
});

module.exports = mongoose.models.Job || mongoose.model('Job', JobSchema);
