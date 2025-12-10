const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  jobid: { type: String, required: true },   // FIXED
  trackingId: { type: String, required: true },
  refId: { type: String },
  sent: { type: Boolean, default: false },
  email_to: { type: String },
  email_subject: { type: String },
  email_content: { type: String },
  id: { type: String },
  draftId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("application-tracking", JobSchema, "Application-Tracking");
