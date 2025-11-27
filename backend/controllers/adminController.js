// backend/controllers/adminController.js
const AdminUser = require("../model/AdminUser");
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
  if (typeof input === "object") {
    const out = {};
    for (const key of Object.keys(input)) {
      if (key.startsWith("$") || key.includes(".")) continue;
      out[key] = sanitizeObject(input[key]);
    }
    return out;
  }
  if (typeof input === "string") return input.trim();
  return input;
}

/**
 * Deterministic email validator (no regex) to avoid ReDoS risks.
 */
function isValidEmail(email) {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return false;
  if (/\s/.test(trimmed)) return false;

  const atCount = (trimmed.match(/@/g) || []).length;
  if (atCount !== 1) return false;

  const [local, domain] = trimmed.split('@');
  if (!local || !domain) return false;

  const lastDot = domain.lastIndexOf('.');
  if (lastDot <= 0 || lastDot === domain.length - 1) return false;

  if (local.startsWith('.') || local.endsWith('.') || domain.startsWith('.') || domain.endsWith('.')) {
    return false;
  }
  return true;
}

// 🔹 Admin register
const registerAdmin = async (req, res) => {
  try {
    console.log("Incoming body (sanitized):", req.body && typeof req.body === 'object' ? Object.keys(req.body) : typeof req.body);

    const safeBody = sanitizeObject(req.body || {});
    const name = typeof safeBody.name === "string" ? safeBody.name.trim() : "";
    const password = typeof safeBody.password === "string" ? safeBody.password : "";
    const emailRaw = safeBody.email;

    if (typeof emailRaw !== "string" || emailRaw.length > 254) {
      return res.status(400).json({ message: "Invalid email" });
    }
    const email = String(emailRaw).trim().toLowerCase();

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const adminExists = await AdminUser.findOne({ email }).lean();
    if (adminExists) return res.status(400).json({ message: "Admin already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const adminDoc = {
      name,
      email,
      password: hashedPassword,
      role: "admin",
    };

    const admin = await AdminUser.create(adminDoc);

    const adminSafe = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };

    res.status(201).json({ message: "Admin created successfully", admin: adminSafe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Admin login
const loginAdmin = async (req, res) => {
  try {
    const safeBody = sanitizeObject(req.body || {});
    const password = typeof safeBody.password === "string" ? safeBody.password : "";
    const emailRaw = safeBody.email;

    if (typeof emailRaw !== "string" || emailRaw.length > 254) {
      return res.status(400).json({ message: "Invalid email" });
    }
    const email = String(emailRaw).trim().toLowerCase();

    const admin = await AdminUser.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    admin.token = token;
    await admin.save();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token: admin.token,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Get all admins
const getAdmins = async (req, res) => {
  try {
    const admins = await AdminUser.find().select("-password");
    res.json(admins);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getAdmins,
};
