class AuthController {
  // GET /login - Show login form
  showLogin(req, res) {
    const error = req.session.loginError;
    delete req.session.loginError;
    
    res.render('login', {
      title: 'Admin Login',
      error
    });
  }

  // POST /login - Process login
  processLogin(req, res) {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'TomRox123!@#';
    
    if (password === adminPassword) {
      req.session.isAuthenticated = true;
      const returnTo = req.session.returnTo || '/dashboard';
      delete req.session.returnTo;
      res.redirect(returnTo);
    } else {
      req.session.loginError = 'Invalid password';
      res.redirect('/login');
    }
  }

  // POST /logout - Logout
  logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.redirect('/login');
    });
  }
}

module.exports = AuthController;
