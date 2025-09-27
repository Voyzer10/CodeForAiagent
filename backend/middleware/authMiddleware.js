const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  console.log('Cookies:', req.cookies);

  const token = req.cookies.token; // Read from cookie instead of header

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // typically contains: { id, email, iat, exp }
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
    console.log('Cookies:', req.cookies);
  }
};

module.exports = auth;

