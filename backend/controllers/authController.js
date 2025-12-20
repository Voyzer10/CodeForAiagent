// controllers/authController.js - Force Sync
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * sanitizeObject(input)
 * - Recursively removes keys that start with '$' or contain '.' (NoSQL injection vectors).
 * - Trims string values.
 */
function sanitizeObject(input) {
  if (input === null || input === undefined) return input;
  if (Array.isArray(input)) return input.map(item => sanitizeObject(item));
  if (typeof input === 'object') {
    const out = {};
    for (const key of Object.keys(input)) {
      if (key.startsWith('$') || key.includes('.')) continue;
      out[key] = sanitizeObject(input[key]);
    }
    return out;
  }
  if (typeof input === 'string') return input.trim();
  return input;
}

/**
 * Deterministic email validator (no regex) to avoid ReDoS risks.
 * - Limits length to 254 characters (practical RFC limit).
 * - Checks there is exactly one '@', no spaces, local and domain parts present,
 *   domain contains at least one dot with characters on both sides, and no leading/trailing dot.
 */
function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return false;
  if (/\s/.test(trimmed)) return false; // no whitespace allowed

  const atCount = (trimmed.match(/@/g) || []).length;
  if (atCount !== 1) return false;

  const [local, domain] = trimmed.split('@');
  if (!local || !domain) return false;

  // domain must contain a dot (.) not at the start or end and with at least one char on both sides
  const lastDot = domain.lastIndexOf('.');
  if (lastDot <= 0 || lastDot === domain.length - 1) return false;

  // simple character checks: local and domain must not start or end with '.'
  if (local.startsWith('.') || local.endsWith('.') || domain.startsWith('.') || domain.endsWith('.')) {
    return false;
  }

  return true;
}

/* ============================================================
   REGISTER USER
============================================================ */
const register = async (req, res) => {
  try {
    console.log('🔹 Register request received');

    const safeBody = sanitizeObject(req.body || {});
    const name = typeof safeBody.name === 'string' ? safeBody.name.trim() : '';
    const password = typeof safeBody.password === 'string' ? safeBody.password : '';
    const emailRaw = safeBody.email;

    // Early type and length guard to avoid heavy processing on large inputs
    if (typeof emailRaw !== 'string' || emailRaw.length > 254) {
      return res.status(400).json({ message: 'Invalid email' });
    }
    const email = String(emailRaw).trim().toLowerCase();

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!passwordRegex.test(password)) {
      console.log('❌ Password does not meet requirements for email:', email);
      return res.status(400).json({
        message:
          'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
      });
    }

    const userExists = await User.findOne({ email }).lean();
    if (userExists) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserDoc = {
      name,
      email,
      password: hashedPassword,
      role: 'user',
    };

    const user = await User.create(newUserDoc);

    console.log('✅ User registered:', user.email);

    return res.status(201).json({
      message: 'User created successfully',
      user: { id: user.userId ?? user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/* ============================================================
   LOGIN USER
============================================================ */
const login = async (req, res) => {
  try {
    const safeBody = sanitizeObject(req.body || {});
    const password = typeof safeBody.password === 'string' ? safeBody.password : '';
    const emailRaw = safeBody.email;

    if (typeof emailRaw !== 'string' || emailRaw.length > 254) {
      return res.status(400).json({ message: 'Invalid email' });
    }
    const email = String(emailRaw).trim().toLowerCase();

    console.log('🔹 Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Invalid password attempt for:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.userId ?? user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '4h' }
    );

    console.log('🔐 JWT created for user:', user.email);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 4 * 60 * 60 * 1000,
    });

    return res.json({
      message: 'Login successful',
      user: {
        id: user.userId ?? user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/* ============================================================
   GET CURRENT USER
============================================================ */
const getCurrentUser = async (req, res) => {
  try {
    const requester = req.user;
    console.log('🔹 Fetching current user for id:', requester?.id);

    const query = resolveUserQuery(requester.id);
    if (!query) return res.status(401).json({ message: 'Unauthorized: Invalid ID' });

    const user = await User.findOne(query).select('-password');

    if (!user) {
      console.log('❌ User not found with ID:', requester.id);
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    console.error('❌ getCurrentUser error:', error);
    return res.status(500).json({ message: 'Error fetching user' });
  }
};

/* ============================================================
   GET ALL USERS (ADMIN)
============================================================ */
const getUsers = async (req, res) => {
  try {
    console.log('🔹 Fetching all users');
    const users = await User.find().select('-password');
    return res.json(users);
  } catch (error) {
    console.error('❌ getUsers error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getUserById = async (req, res) => {
  try {
    const query = resolveUserQuery(req.params.id);
    if (!query) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const user = await User.findOne(query).select('-password');

    if (!user) {
      console.log('❌ User not found:', req.params.id);
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    console.error('❌ getUserById error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/* ============================================================
   LOGOUT USER
============================================================ */
const logoutUser = async (req, res) => {
  try {
    console.log('🔹 Logout request received.');

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    console.log('✅ User logged out successfully');

    return res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    console.error('❌ Logout error:', err);
    return res.status(500).json({
      success: false,
      message: 'Logout failed',
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  getUsers,
  getUserById,
  logoutUser,
};
