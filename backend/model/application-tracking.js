// model/application-tracking.js
const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  {
    jobid: { type: String, required: true, index: true, unique: true },
    trackingId: { type: String, required: true },
    refId: { type: String },

    // ⚠️ n8n sends string, app expects boolean
    sent: {
      type: mongoose.Schema.Types.Mixed, // <-- IMPORTANT
      default: false,
    },

    email_to: { type: String },
    email_subject: { type: String },
    email_content: { type: String },
    id: { type: String },
    draftId: { type: String },
  },
  { timestamps: true }
);

/**
 * ✅ Virtual field: always returns BOOLEAN
 * This protects your frontend & business logic forever
 */
JobSchema.virtual("isApplied").get(function () {
  return this.sent === true || this.sent === "true";
});

/**
 * Ensure virtuals are included in JSON
 */
JobSchema.set("toJSON", { virtuals: true });
JobSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model(
  "application-tracking",
  JobSchema,
  "Application-Tracking"
);
