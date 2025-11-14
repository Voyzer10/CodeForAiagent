const express = require('express');
const { getGmailTokens } = require('../controllers/googleController.js');

// Existing auth controllers
const { 
  register, 
  login, 
  getUsers, 
  getUserById, 
  getCurrentUser 
} = require('../controllers/authController.js');

// User controllers
const { 
  updateSocialLinks, 
  updateClientData 
} = require('../controllers/userController.js');

// Middleware
const auth = require('../middleware/authMiddleware.js');

// NEW: Google OAuth controller
const { 
  googleRedirect, 
  googleCallback 
} = require('../controllers/googleController.js');

const router = express.Router();

/* ----------------------------
   AUTH ROUTES (Already Existing)
----------------------------- */

router.post('/register', register);
router.post('/login', login);

router.get('/users', getUsers);
router.get('/users/:id', getUserById);

router.get('/me', auth, getCurrentUser);

router.post('/update-socials', auth, updateSocialLinks);
router.post('/update-client', auth, updateClientData);

/* ----------------------------
   GOOGLE OAUTH ROUTES (NEW)
----------------------------- */

// Step-1 → Logged in user clicks "Connect Gmail"
router.get('/auth/google', auth, googleRedirect);

// Step-2 → Google redirects back here with tokens
router.get('/auth/google/callback', googleCallback);

// n8n → Fetch Gmail tokens for a specific user
router.get("/gmail/tokens/:userId", getGmailTokens);

module.exports = router;
