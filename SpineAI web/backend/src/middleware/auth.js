import jwt from 'jsonwebtoken';

/**
 * Authentication middleware
 * - Verifies JWT access token
 * - Extracts user information from token
 * - Passes user data to protected routes
 */
export const authenticate = (req, res, next) => {
  console.log('🔐 Authenticate middleware called');
  console.log('📨 Headers:', req.headers);
  
  try {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('🎫 Token:', token ? `${token.substring(0, 20)}...` : 'YOK');

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    console.log('✅ Token decoded:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.log('❌ Auth error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * Authorization middleware
 * - Checks if user has required role
 * - Used for role-based access control
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden - insufficient permissions' });
    }

    next();
  };
};

/**
 * Error handling middleware
 * - Catches all errors and returns appropriate response
 * - Logs errors for debugging
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ message: `${field} already exists` });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error',
  });
};

/**
 * Request logging middleware
 */
export const requestLogger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};
