const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    unique: true,
    default: () => new mongoose.Types.ObjectId() // auto-generate
  },
});

module.exports = mongoose.model("User", userSchema, "applicants");
