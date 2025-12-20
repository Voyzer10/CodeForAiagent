const express = require("express");

// =================== Controllers ===================
const {
  register,
  login,
  getUsers,
  getUserById,
  getCurrentUser,
  logoutUser,
} = require("../controllers/authController.js");

const {
  updateSocialLinks,
  updateClientData,
  updatePreferences,
} = require("../controllers/userController.js");

const {
  googleLoginRedirect,
  googleLoginCallback,
  gmailRedirect,
  gmailCallback,
  getGmailTokens,
} = require("../controllers/googleController.js");

const { createGmailDraft } = require("../controllers/gmailDraftController.js")

// =================== Middleware ===================
const auth = require("../middleware/authMiddleware.js");

const router = express.Router();

/* ======================================================
   USER AUTH ROUTES
====================================================== */

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logoutUser);

router.get("/users", getUsers);
router.get("/users/:id", getUserById);

router.get("/me", auth, getCurrentUser);

router.post("/update-socials", auth, updateSocialLinks);
router.post("/update-client", auth, updateClientData);
router.post("/update-preferences", auth, updatePreferences);

/* ======================================================
   GOOGLE LOGIN (Website Sign-in)
====================================================== */
// PUBLIC ROUTES
router.get("/login/google", googleLoginRedirect);
router.get("/login/google/callback", googleLoginCallback);

// PROTECTED ROUTES
router.get("/gmail/connect", auth, gmailRedirect);
router.get("/gmail/callback", gmailCallback);
router.get("/gmail/tokens/:userId", getGmailTokens);
router.post("/gmail/create-draft", createGmailDraft);
;

module.exports = router;
