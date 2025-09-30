const express = require("express");
const { createJob, getUserJobs } = require("../controllers/jobController");
const auth = require("../middleware/authMiddleware");
const adminAuth = require("../middleware/adminMiddleware");

const router = express.Router();

// ✅ Auth lagao aur req.user se userId lo
router.post("/", auth, createJob);
router.get("/", auth, getUserJobs);
router.get("/all", auth, adminAuth, getAllUserJobs); // admin only 👑

module.exports = router;
