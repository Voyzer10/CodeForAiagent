const express = require('express');
const { register, login, getUsers, getUserById, getCurrentUser } = require('../controllers/authController.js');
const auth = require('../middleware/authMiddleware.js'); // fixed import
const { updateSocialLinks } = require('../controllers/userController.js');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users', getUsers);
// router.get('/users/me', auth, getCurrentUser);
router.get('/users/:id', getUserById);
router.get("/me", auth, getCurrentUser);
router.post("/update-socials", auth, updateSocialLinks);


module.exports = router;
