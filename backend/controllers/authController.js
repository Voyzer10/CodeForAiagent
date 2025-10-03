const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("🔹 Register request:", req.body);

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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user"
    });

    console.log("✅ User registered:", user);

    res.status(201).json({
      message: 'User created successfully',
      user: { id: user.userId, name: user.name, email: user.email }
    });
  } catch (err) {
    console.log("❌ Register error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔹 Login attempt:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Invalid password for:", email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 🔑 Create JWT
    const token = jwt.sign(
      { id: user.userId, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '4h' }
    );

    console.log("✅ JWT created:", token);

    // Send token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.userId,
        name: user.name,
        email: user.email,
        role: user.role
      },
    });

  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// CURRENT USER
const getCurrentUser = async (req, res) => {
  try {
    console.log("🔹 Decoded user from token:", req.user);

    const user = await User.findOne({ userId: req.user.id }).select('-password -token');
    console.log("🔹 DB lookup result:", user);

    if (!user) {
      console.log("❌ User not found with ID:", req.user.id);
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    console.error("❌ getCurrentUser error:", err);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

// ADMIN ONLY - ALL USERS
const getUsers = async (req, res) => {
  try {
    console.log("🔹 Fetching all users");
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error("❌ getUsers error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET USER BY ID
const getUserById = async (req, res) => {
  try {
    console.log("🔹 Fetching user by ID:", req.params.id);
    const user = await User.findOne({ userId: req.params.id }).select('-password');
    if (!user) {
      console.log("❌ User not found with ID:", req.params.id);
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("❌ getUserById error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  getUsers,
  getUserById,
};
