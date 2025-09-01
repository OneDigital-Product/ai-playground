function requireAuth(req, res, next) {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }
  
  // Store the original URL to redirect back after login
  req.session.returnTo = req.originalUrl;
  res.redirect('/login');
}

function skipAuth(req, res, next) {
  // Skip authentication - allow all requests
  next();
}

module.exports = {
  requireAuth,
  skipAuth
};
