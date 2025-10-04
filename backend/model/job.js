const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String },
  postedAt: { type: Date, default: Date.now },
  applicantsCount: { type: Number, default: 0 },
  salary: { type: String },
  benefits: { type: [String] },
  descriptionText: { type: String },
  descriptionHtml: { type: String },
  seniorityLevel: { type: String },
  employmentType: { type: String },
  jobFunction: { type: String },
  industries: { type: [String] },
  link: { type: String },
  applyUrl: { type: String },
  inputUrl: { type: String },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  jobPosterId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPoster', required: true }
});

module.exports = mongoose.models.Job || mongoose.model('Job', JobSchema);
