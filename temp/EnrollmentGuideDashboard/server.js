const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pino = require('pino');
const Database = require('./config/database');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;
const logger = pino();

// Ensure data directories exist
const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(dataDir, 'uploads');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Initialize database
const db = new Database();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

// Debug middleware to log requests
app.use((req, res, next) => {
  if (req.method === 'POST' && req.url === '/intakes') {
    console.log('POST /intakes - Headers:', req.headers);
    console.log('POST /intakes - Content-Type:', req.get('content-type'));
  }
  next();
});

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'enrollment-guide-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Logging middleware
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip
  }, 'HTTP Request');
  next();
});

// Routes
app.use('/', routes);

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error(error, 'Application Error');
  res.status(500).render('error', { 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { 
    error: 'Page Not Found',
    message: 'The requested page could not be found.'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Enrollment Guide Intake App running on port ${PORT}`);
});

module.exports = app;
