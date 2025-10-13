const express = require("express");
const {
  createJob,
  getUserJobs,
  getAllUserJobs,
} = require("../controllers/jobController");
const auth = require("../middleware/authMiddleware");
const adminAuth = require("../middleware/adminMiddleware");

const router = express.Router();

/**
 * =========================
 * USER ROUTES (Auth Required)
 * =========================
 */

// ✅ Create a job (user must be logged in)
router.post("/", auth, (req, res, next) => {
  console.log("➡️ POST /api/jobs - Create job request");
  next();
}, createJob);

// ✅ Get logged-in user’s jobs
router.get("/", auth, (req, res, next) => {
  console.log("➡️ GET /api/jobs - Fetch jobs for logged-in user");
  next();
}, getUserJobs);

// ✅ Get jobs for a specific user (by userId param)
router.get("/:userId",  auth,(req, res, next) => {
  console.log(`➡️ GET /api/userjobs/${req.params.userId} - Fetch jobs by userId`);
  next();
}, getUserJobs);




/**
 * =========================
 * ADMIN ROUTES (Admin Only)
 * =========================
 */

// ✅ Get all jobs across all users
router.get("/all", auth, adminAuth, (req, res, next) => {
  console.log("➡️ GET /api/jobs/all - Admin fetching all jobs");
  next();
}, getAllUserJobs);

module.exports = router;
