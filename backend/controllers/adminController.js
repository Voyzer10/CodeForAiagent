// backend/controllers/adminController.js
const AdminUser = require("../model/AdminUser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Simple recursive sanitizer: removes keys starting with '$' or containing '.'.
// Also returns trimmed strings for string values.
// This defends against typical NoSQL injection payload keys like {"$gt":""}
function sanitizeObject(input) {
  if (input === null || input === undefined) return input;

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeObject(item));
  }

  if (typeof input === "object") {
    const out = {};
    for (const key of Object.keys(input)) {
      // skip keys that could be operator injections or nested path injections
      if (key.startsWith("$") || key.includes(".")) {
        // drop this key entirely
        continue;
      }
      const value = input[key];
      out[key] = sanitizeObject(value);
    }
    return out;
  }

  if (typeof input === "string") {
    return input.trim();
  }

  // numbers / booleans / other primitives
  return input;
}

// Simple email regex check (reasonable for input validation).
// If you prefer, use `validator` package's isEmail() in production.
function isValidEmail(email) {
  if (typeof email !== "string") return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

// 🔹 Admin register
const registerAdmin = async (req, res) => {
  try {
    // sanitize the incoming body first
    const safeBody = sanitizeObject(req.body || {});
    // whitelist allowed fields only
    const name = typeof safeBody.name === "string" ? safeBody.name.trim() : "";
    const password = typeof safeBody.password === "string" ? safeBody.password : "";
    const emailRaw = safeBody.email;
    const email = typeof emailRaw === "string" ? String(emailRaw).trim().toLowerCase() : "";

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // lookup using the sanitized email (string) only
    const adminExists = await AdminUser.findOne({ email }).lean();
    if (adminExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // explicitly construct the object we create in DB (no req.body spread)
    const adminDoc = {
      name,
      email,
      password: hashedPassword,
      role: "admin",
    };

    const admin = await AdminUser.create(adminDoc);

    // Avoid returning password; Mongoose doc contains it, so strip before sending
    const adminSafe = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };

    res.status(201).json({ message: "Admin created successfully", admin: adminSafe });
  } catch (err) {
    console.error("registerAdmin error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Admin login
const loginAdmin = async (req, res) => {
  try {
    const safeBody = sanitizeObject(req.body || {});
    const password = typeof safeBody.password === "string" ? safeBody.password : "";
    const emailRaw = safeBody.email;
    const email = typeof emailRaw === "string" ? String(emailRaw).trim().toLowerCase() : "";

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Query with sanitized string only
    const admin = await AdminUser.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Save token in DB explicitly (only token field)
    admin.token = token;
    await admin.save();

    // Set cookie (same as before)
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
    console.error("loginAdmin error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Get all admins (optional, only for super-admin if needed)
const getAdmins = async (req, res) => {
  try {
    const admins = await AdminUser.find().select("-password -__v"); // avoid sending sensitive fields
    res.json(admins);
  } catch (err) {
    console.error("getAdmins error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getAdmins,
};
