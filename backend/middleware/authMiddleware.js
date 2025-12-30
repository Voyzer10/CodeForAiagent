const jwt = require('jsonwebtoken');
const User = require("../model/User");


const auth = async (req, res, next) => {
  console.log("Cookies received:", req.cookies); // 👈 Add here

  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists and token is not revoked
    const user = await User.findOne({
      $or: [
        { userId: decoded.id },
        { _id: typeof decoded.id === 'string' && decoded.id.length === 24 ? decoded.id : null }
      ].filter(q => q._id !== null || q.userId !== undefined)
    }).select('tokenVersion');

    if (!user || user.tokenVersion !== (decoded.tokenVersion || 0)) {
      return res.status(401).json({ message: 'Session expired or revoked' });
    }

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
module.exports.protect = auth; // Alias for backward compatibility
