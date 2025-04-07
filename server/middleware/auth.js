/**
 * Authentication middleware for securing API routes
 */

// Helper function to check if a user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Unauthorized access' });
};

// Helper function to check if a user is an admin
const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user && req.user.is_admin) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Admin privileges required' });
};

// Allow a route to be accessed by either an admin or a specific user (by ID)
const isAdminOrSelf = (idParam) => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, message: 'Unauthorized access' });
    }
    
    const paramId = parseInt(req.params[idParam], 10);
    
    if (req.user.is_admin || req.user.id === paramId) {
      return next();
    }
    
    return res.status(403).json({ success: false, message: 'Insufficient permissions' });
  };
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isAdminOrSelf
};