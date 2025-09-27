const express = require('express');
const { register, login, getUsers, getUserById, getCurrentUser } = require('../controllers/authController.js');
const auth = require('../middleware/authMiddleware.js'); // fixed import

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users', getUsers);
router.get('/users/me', auth, getCurrentUser);
router.get('/users/:id', getUserById);

module.exports = router;
