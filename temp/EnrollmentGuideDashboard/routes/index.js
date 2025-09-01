const express = require('express');
const path = require('path');
const router = express.Router();

const IntakeController = require('../controllers/intakeController');
const DashboardController = require('../controllers/dashboardController');
const AuthController = require('../controllers/authController');
const UploadModel = require('../models/upload');
const { requireAuth } = require('../middleware/auth');
const { handleMulterError } = require('../middleware/validation');

// Initialize controllers
const intakeController = new IntakeController();
const dashboardController = new DashboardController();
const authController = new AuthController();
const uploadModel = new UploadModel();

// Root redirect
router.get('/', (req, res) => {
  res.redirect('/dashboard');
});

// Authentication routes
router.get('/login', authController.showLogin.bind(authController));
router.post('/login', authController.processLogin.bind(authController));
router.post('/logout', authController.logout.bind(authController));

// Apply authentication middleware to protect all routes below
router.use('/dashboard', requireAuth);
router.use('/intakes', requireAuth);
router.use('/uploads', requireAuth);

// Dashboard routes (protected)
router.get('/dashboard', dashboardController.showDashboard.bind(dashboardController));
router.get('/dashboard/export.csv', dashboardController.exportCSV.bind(dashboardController));
router.get('/dashboard/stats', dashboardController.getStats.bind(dashboardController));

// Intake routes (protected)
router.get('/intakes/new', intakeController.showNewForm.bind(intakeController));
router.post('/intakes', intakeController.create.bind(intakeController));
router.get('/intakes/:intakeId', intakeController.showDetail.bind(intakeController));
router.post('/intakes/:intakeId/status', intakeController.updateStatus.bind(intakeController));
router.post('/intakes/:intakeId/sections/:code', intakeController.updateSection.bind(intakeController));
router.post('/intakes/:intakeId/uploads', intakeController.handleUpload.bind(intakeController));
router.delete('/intakes/:intakeId', intakeController.delete.bind(intakeController));

// Upload routes
router.delete('/uploads/:id', async (req, res) => {
  try {
    const success = uploadModel.delete(req.params.id);
    if (success) {
      res.json({ success: true, message: 'File deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Delete upload error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// File download route
router.get('/uploads/:id/download', async (req, res) => {
  try {
    const upload = uploadModel.getById(req.params.id);
    if (!upload) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const filePath = path.join(__dirname, '..', upload.stored_path);
    res.download(filePath, upload.original_name);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Error handling for multer
router.use(handleMulterError);

module.exports = router;
