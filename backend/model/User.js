const mongoose = require("mongoose");

function generateUserId() {
  // Generates a random 5-digit number between 10000 and 99999
  return Math.floor(10000 + Math.random() * 90000);
}

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userId: { 
    type: Number, 
    required: true, 
    unique: true,
    default: generateUserId
  },
});

module.exports = mongoose.model("User", userSchema, "applicants");