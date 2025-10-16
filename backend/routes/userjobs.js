const express = require("express");
const {
  createJob,
  getUserJobs,
  getAllUserJobs,
  updateJobCredits,
} = require("../controllers/jobController");
const auth = require("../middleware/authMiddleware");
const adminAuth = require("../middleware/adminMiddleware");
const { getUserCategories, addUserCategory } = require("../controllers/userController");

const router = express.Router();

/**
 * =========================
 * USER ROUTES (Auth Required)
 * =========================
 */

// ✅ Create a job
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
router.get("/:userId", auth, (req, res, next) => {
  console.log(`➡️ GET /api/jobs/${req.params.userId} - Fetch jobs by userId`);
  next();
}, getUserJobs);




router.get("/categories/:userId", auth, getUserCategories);
router.post("/categories/:userId", auth, addUserCategory);

/**
 * =========================
 * WEBHOOK ROUTE (No Auth)
 * =========================
 */

// ✅ Apify/n8n webhook for updating job credits
router.post("/update-job-credits", (req, res, next) => {
  console.log("➡️ POST /api/jobs/update-job-credits - Webhook received");
  next();
}, updateJobCredits);

/**
 * =========================
 * ADMIN ROUTES (Admin Only)
 * =========================
 */

// ✅ Admin: Fetch all jobs
router.get("/all", auth, adminAuth, (req, res, next) => {
  console.log("➡️ GET /api/jobs/all - Admin fetching all jobs");
  next();
}, getAllUserJobs);

module.exports = router;
