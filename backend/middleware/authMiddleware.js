const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // 1️⃣ Check cookies
  let token = req.cookies?.token;

  // 2️⃣ Check Authorization header if token not in cookies
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    console.log('⚠️ No token found');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔑 Attach role also
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'user', // default "user"
    };

    console.log('👤 Authenticated user:', req.user);
    next();
  } catch (err) {
    console.log('⚠️ Invalid token:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = auth;
