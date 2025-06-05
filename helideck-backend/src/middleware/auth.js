const jwt = require('jsonwebtoken');
const { hasPermission, ROLES } = require('../constants/roles');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check if user has required permission
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role || ROLES.SUPPLIER;
    
    if (!hasPermission(userRole, permission)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permission,
        userRole: userRole
      });
    }

    next();
  };
};

// Middleware to check if user has one of the specified roles
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role || ROLES.SUPPLIER;
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Insufficient role privileges',
        required: roles,
        userRole: userRole
      });
    }

    next();
  };
};

module.exports = { 
  authenticateToken,
  requirePermission,
  requireRole
};