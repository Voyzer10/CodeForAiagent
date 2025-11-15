const express = require("express");

// =================== Controllers ===================
const {
  register,
  login,
  getUsers,
  getUserById,
  getCurrentUser,
} = require("../controllers/authController.js");

const {
  updateSocialLinks,
  updateClientData,
} = require("../controllers/userController.js");

const {
  googleRedirect,
  googleCallback,
  getGmailTokens,
} = require("../controllers/googleController.js");

// =================== Middleware ===================
const auth = require("../middleware/authMiddleware.js");

const router = express.Router();

/* ======================================================
   USER AUTH ROUTES
====================================================== */

router.post("/register", register);
router.post("/login", login);

router.get("/users", getUsers);
router.get("/users/:id", getUserById);

router.get("/me", auth, getCurrentUser);

router.post("/update-socials", auth, updateSocialLinks);
router.post("/update-client", auth, updateClientData);

/* ======================================================
   GOOGLE OAUTH ROUTES
====================================================== */

// STEP-1: User clicks "Continue with Google"
router.get("/google", auth, googleRedirect);

// STEP-2: Google redirects here after consent
router.get("/google/callback", googleCallback);

/* ======================================================
   n8n → Secure Gmail Token Fetch Route
====================================================== */

router.get("/gmail/tokens/:userId", getGmailTokens);

module.exports = router;
