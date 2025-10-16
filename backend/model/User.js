const mongoose = require("mongoose");

function generateUserId() {
  return Math.floor(10000 + Math.random() * 90000); // 5-digit ID
}

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },


  // 🔑 Separate userId for identification
  userId: { 
    type: Number, 
    required: true, 
    unique: true,
    default: generateUserId 
  },

  // 🔑 Separate role field
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },

  // 🔑 Store last JWT token if needed
  token: { type: String },
  plan: {
    type: {
      type: String,
      enum: ["starter", "professional", "premium", null],
      default: null,
    },
    remainingJobs: { type: Number, default: 0 },
    purchasedAt: Date,
    expiresAt: Date,
  },
  customCategories: { type: [String], default: [] },
});

module.exports = mongoose.model("User", userSchema, "applicants");
