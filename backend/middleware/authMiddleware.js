const jwt = require('jsonwebtoken');
const User = require("../model/User");


const auth = (req, res, next) => {
  console.log("Cookies received:", req.cookies); // 👈 Add here

  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'user',
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = auth;
