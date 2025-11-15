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
  googleLoginRedirect,
  googleLoginCallback,
  gmailRedirect,
  gmailCallback,
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
   GOOGLE LOGIN (Website Sign-in)
====================================================== */

// Step 1 → Redirect to Google Login
router.get("/login/google", googleLoginRedirect);

// Step 2 → Google → Callback → Generate JWT
router.get("/login/google/callback", googleLoginCallback);

/* ======================================================
   GMAIL CONNECT (OAuth for sending emails)
====================================================== */

// Step 1 → User clicks "Connect Gmail"
router.get("/gmail/connect", auth, gmailRedirect);

// Step 2 → Google sends tokens
router.get("/gmail/callback", gmailCallback);

/* ======================================================
   n8n → Secure Gmail Token Fetch Route
====================================================== */

router.get("/gmail/tokens/:userId", getGmailTokens);

module.exports = router;
