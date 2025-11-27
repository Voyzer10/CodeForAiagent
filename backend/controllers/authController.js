// controllers/authController.js
const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/* ============================================================
   REGISTER USER
============================================================ */
const register = async (req, res) => {
  try {
    console.log("🔹 Register request:", req.body);

    const { name, password } = req.body;
    const email = String(req.body.email);

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

    if (!passwordRegex.test(password)) {
      console.log("❌ Password does not meet requirements");
      return res.status(400).json({
        message:
          'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("❌ User already exists:", email);
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    console.log("✅ User registered:", user.email);

    return res.status(201).json({
      message: 'User created successfully',
      user: { id: user.userId, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error("❌ Register error:", error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/* ============================================================
   LOGIN USER
============================================================ */
const login = async (req, res) => {
  try {
    const { password } = req.body;
    const email = String(req.body.email);
    console.log("🔹 Login attempt:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Invalid password for user:", email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.userId, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '4h' }
    );

    console.log("🔐 JWT created for:", user.email);

    // Send token as a secure HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 4 * 60 * 60 * 1000, // 4 hours
    });

    return res.json({
      message: "Login successful",
      user: {
        id: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ============================================================
   GET CURRENT USER
============================================================ */
const getCurrentUser = async (req, res) => {
  try {
    console.log("🔹 Fetching current user:", req.user);

    const user = await User.findOne({ userId: req.user.id }).select('-password');

    if (!user) {
      console.log("❌ User not found with ID:", req.user.id);
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    console.error("❌ getCurrentUser error:", error);
    return res.status(500).json({ message: "Error fetching user" });
  }
};

/* ============================================================
   GET ALL USERS (ADMIN)
============================================================ */
const getUsers = async (req, res) => {
  try {
    console.log("🔹 Fetching all users");

    const users = await User.find().select('-password');
    return res.json(users);

  } catch (error) {
    console.error("❌ getUsers error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ============================================================
   GET USER BY ID
============================================================ */
const getUserById = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    console.log("🔹 Fetching user by ID:", userId);

    const user = await User.findOne({ userId }).select('-password');

    if (!user) {
      console.log("❌ User not found:", req.params.id);
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);

  } catch (error) {
    console.error("❌ getUserById error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ============================================================
   LOGOUT USER
============================================================ */
const logoutUser = async (req, res) => {
  try {
    console.log("🔹 Logout request received.");

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",  // IMPORTANT
    });

    console.log("✅ User logged out successfully");

    return res.json({
      success: true,
      message: "Logged out successfully",
    });

  } catch (err) {
    console.error("❌ Logout error:", err);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

/* ============================================================
   EXPORT CONTROLLERS (FIXED)
============================================================ */
module.exports = {
  register,
  login,
  getCurrentUser,
  getUsers,
  getUserById,
  logoutUser,
};
