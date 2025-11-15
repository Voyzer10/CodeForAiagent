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
// PUBLIC ROUTES
router.get("/login/google", googleLoginRedirect);
router.get("/login/google/callback", googleLoginCallback);

// PROTECTED ROUTES
router.get("/gmail/connect", auth, gmailRedirect);
router.get("/gmail/callback", gmailCallback);
router.get("/gmail/tokens/:userId", getGmailTokens);
;

module.exports = router;
