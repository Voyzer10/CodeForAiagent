const express = require("express");

// =================== Controllers ===================
const {
  register,
  login,
  getUsers,
  getUserById,
  getCurrentUser,
  logoutUser,
  changePassword,
  logoutAllDevices,
  getActiveSessions,
  revokeSession,
} = require("../controllers/authController.js");

const {
  updateSocialLinks,
  updateClientData,
  updatePreferences,
  updateProfile,
  submitSupportTicket,
  updateResume,
  removeResume,
  disconnectGmail,
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
router.post("/update-profile", auth, updateProfile);
router.post("/support-ticket", auth, submitSupportTicket);
router.post("/update-resume", auth, updateResume);
router.post("/remove-resume", auth, removeResume);

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
router.post("/gmail/create-draft", auth, createGmailDraft);
router.post("/gmail/disconnect", auth, disconnectGmail);

router.post("/change-password", auth, changePassword);
router.post("/logout-all", auth, logoutAllDevices);
router.get("/sessions", auth, getActiveSessions);
router.delete("/sessions/:requestId", auth, revokeSession);
;

module.exports = router;
