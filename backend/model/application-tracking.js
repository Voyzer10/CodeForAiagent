const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  jobId: { type: String, required: true },
  trackingId: { type: String, required: true },
  refId: { type: String },
  sent: { type: Boolean, default: false }, // change to Date if needed
  email_to: { type: String },
  email_subject: { type: String },
  email_content: { type: String },
  id: { type: String } // ⚠️ consider renaming to "customId" to avoid confusion with _id
}, { timestamps: true });

module.exports = mongoose.model("application-tracking", JobSchema, "Application-Tracking");




