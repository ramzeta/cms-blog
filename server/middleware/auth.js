import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'No token provided'
      });
    }

    // Verify token with proper error handling
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            error: 'Token expired',
            message: 'Your session has expired. Please login again.'
          });
        }
        return res.status(403).json({
          error: 'Invalid token',
          message: 'The provided authentication token is invalid.'
        });
      }

      req.user = decoded;
      next();
    });
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({
      error: 'Server error',
      message: 'Authentication process failed'
    });
  }
};

export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'You do not have permission to perform this action'
      });
    }

    next();
  };
};