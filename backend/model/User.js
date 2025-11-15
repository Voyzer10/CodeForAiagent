const mongoose = require("mongoose");

function generateUserId() {
  return Math.floor(10000 + Math.random() * 90000); // 5-digit ID
}

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String},
    authProvider: { type: String, default: "email" },


    // Custom numeric userId
    userId: {
      type: Number,
      required: true,
      unique: true,
      default: generateUserId,
    },

    // Role
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // JWT token (optional)
    token: { type: String },

    // Subscription Plan
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

    savedSearches: [
      {
        name: String,
        jobs: Array,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    github: { type: String, default: "" },
    linkedin: { type: String, default: "" },

    // Client Keys
    clientId: {
      type: String,
      default: "",
      trim: true,
    },
    clientSecret: {
      type: String,
      default: "",
      trim: true,
    },

    /* -----------------------------------------
     🔥 GOOGLE GMAIL OAUTH FIELDS (NEW)
    ------------------------------------------*/

    gmailEmail: { type: String, default: null }, // user's gmail address

    gmailAccessToken: { type: String, default: null }, // encrypted access token

    gmailRefreshToken: { type: String, default: null }, // encrypted refresh token

    gmailTokenExpiry: { type: Date, default: null }, // when access token expires

    gmailConnectedAt: { type: Date, default: null }, // when user connected email
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema, "applicants");

