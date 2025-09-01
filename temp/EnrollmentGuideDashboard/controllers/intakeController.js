const IntakeModel = require('../models/intake');
const SectionModel = require('../models/section');
const UploadModel = require('../models/upload');
const { validateIntakeCreate, validateSectionUpdate } = require('../schemas/intakeSchemas');
const { calculateComplexity } = require('../utils/complexity');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

class IntakeController {
  constructor() {
    this.intakeModel = new IntakeModel();
    this.sectionModel = new SectionModel();
    this.uploadModel = new UploadModel();
    
    // Configure multer for file uploads
    this.upload = multer({
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(__dirname, '../data/uploads');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const timestamp = Date.now();
          const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
          cb(null, `${timestamp}_${sanitized}`);
        }
      }),
      limits: {
        fileSize: 25 * 1024 * 1024 // 25MB
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'image/png',
          'image/jpeg'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type'), false);
        }
      }
    });
  }

  // GET /intakes/new - Show intake form
  showNewForm(req, res) {
    try {
      const savedData = req.session.intakeFormData || {};
      
      res.render('intake-new', {
        title: 'New Intake Request',
        formData: savedData,
        errors: req.session.errors || {},
        sections: this.getSectionDefinitions()
      });
      
      // Clear errors after displaying
      delete req.session.errors;
    } catch (error) {
      res.status(500).render('error', { 
        error: 'Form Load Error',
        message: 'Unable to load the intake form'
      });
    }
  }

  // POST /intakes - Create new intake
  async create(req, res) {
    try {
      // Process single-page form submission
      console.log('Raw body:', req.rawBody);
      console.log('Content-Type:', req.get('content-type'));
      console.log('Received form data:', req.body);
      console.log('Body keys:', Object.keys(req.body || {}));
      console.log('Files received:', req.files);
      
      // Store form data temporarily in session in case of validation errors
      req.session.intakeFormData = req.body;

      // Fix array issue for payroll_storage_url
      if (Array.isArray(req.body.payroll_storage_url)) {
        req.body.payroll_storage_url = req.body.payroll_storage_url[0] || '';
      }

      // Validate the form data
      const validation = validateIntakeCreate.safeParse(req.body);
      
      if (!validation.success) {
        console.log('Validation failed:', validation.error.flatten().fieldErrors);
        req.session.errors = validation.error.flatten().fieldErrors;
        return res.redirect('/intakes/new');
      }

      console.log('Validation passed:', validation.data);

      const intakeData = validation.data;
      
      // Process sections data
      const sectionsData = this.processSectionsData(req.body);
      
      // Create intake
      const intake = await this.intakeModel.create({
        ...intakeData,
        sections_changed_flags: this.extractChangedFlags(req.body),
        sections_included_flags: this.extractIncludedFlags(req.body)
      });

      // Create section details
      if (sectionsData && Object.keys(sectionsData).length > 0) {
        await this.sectionModel.bulkCreate(intake.intake_id, sectionsData);
      }

      // Clear session data
      delete req.session.intakeFormData;
      delete req.session.errors;

      // Redirect to detail view
      res.redirect(`/intakes/${intake.intake_id}?created=1`);
      
    } catch (error) {
      console.error('Create intake error:', error);
      req.session.errors = { general: ['Failed to create intake request'] };
      res.redirect('/intakes/new');
    }
  }

  // GET /intakes/:intakeId - Show intake detail
  async showDetail(req, res) {
    try {
      const intake = this.intakeModel.getById(req.params.intakeId);
      
      if (!intake) {
        return res.status(404).render('error', {
          error: 'Intake Not Found',
          message: 'The requested intake could not be found'
        });
      }

      const sections = this.sectionModel.getOrganizedSections(intake.intake_id);
      
      const tab = req.query.tab || 'overview';
      const created = req.query.created === '1';

      res.render('intake-detail', {
        title: `Intake ${intake.intake_id}`,
        intake,
        sections,
        activeTab: tab,
        showCreatedMessage: created,
        sectionDefinitions: this.getSectionDefinitions()
      });
      
    } catch (error) {
      console.error('Show detail error:', error);
      res.status(500).render('error', {
        error: 'Load Error',
        message: 'Unable to load intake details'
      });
    }
  }

  // POST /intakes/:intakeId/status - Update status
  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const validStatuses = ['NOT_STARTED', 'STARTED', 'ROADBLOCK', 'READY_FOR_QA', 'DELIVERED_TO_CONSULTANT'];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const success = this.intakeModel.updateStatus(req.params.intakeId, status);
      
      if (success) {
        res.json({ success: true, message: 'Status updated successfully' });
      } else {
        res.status(404).json({ error: 'Intake not found' });
      }
      
    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({ error: 'Failed to update status' });
    }
  }

  // POST /intakes/:intakeId/sections/:code - Update section
  async updateSection(req, res) {
    try {
      const { intakeId, code } = req.params;
      const validation = validateSectionUpdate.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors
        });
      }

      await this.sectionModel.upsert({
        intake_id: intakeId,
        section_code: code,
        payload: validation.data
      });

      res.json({ success: true, message: 'Section updated successfully' });
      
    } catch (error) {
      console.error('Update section error:', error);
      res.status(500).json({ error: 'Failed to update section' });
    }
  }

  // POST /intakes/:intakeId/uploads - Handle file upload
  handleUpload(req, res) {
    this.upload.array('files', 10)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const { intakeId } = req.params;
        const { kind = 'OTHER' } = req.body;
        const uploadedFiles = [];

        for (const file of req.files) {
          const upload = await this.uploadModel.create({
            intake_id: intakeId,
            kind,
            original_name: file.originalname,
            mime_type: file.mimetype,
            bytes: file.size,
            stored_path: `data/uploads/${file.filename}`
          });
          
          uploadedFiles.push(upload);
        }

        res.json({ 
          success: true, 
          message: `${uploadedFiles.length} file(s) uploaded successfully`,
          files: uploadedFiles
        });
        
      } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to process upload' });
      }
    });
  }

  // Helper methods
  checkForSectionChanges(formData) {
    const sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q'];
    const changes = sections.map(section => ({
      section,
      value: formData[`section_${section}_changed`],
      hasChange: formData[`section_${section}_changed`] === 'yes'
    }));
    console.log('Checking section changes:', changes);
    return sections.some(section => formData[`section_${section}_changed`] === 'yes');
  }

  getSectionDefinitions() {
    return {
      A: { name: 'Eligibility', allowMultiple: false },
      B: { name: 'Enrollment', allowMultiple: false },
      C: { name: 'Benefits Administration', allowMultiple: false },
      D: { name: 'Medical- Plans and Plan Designs', allowMultiple: false },
      E: { name: 'Medical- Deductible Support (EX:HRA/HSA)', allowMultiple: false },
      F: { name: 'Medical- Spending Accounts (EX:FSA/LPFSA/DCA)', allowMultiple: false },
      G: { name: 'Medical- Telehealth', allowMultiple: false },
      H: { name: 'Dental', allowMultiple: false },
      I: { name: 'Vision', allowMultiple: false },
      J: { name: 'Life/AD&D', allowMultiple: false },
      K: { name: 'Voluntary Life/AD&D', allowMultiple: false },
      L: { name: 'Short Term Disability', allowMultiple: false },
      M: { name: 'Long Term Disability', allowMultiple: false },
      N: { name: 'Statutory Leave', allowMultiple: false },
      O: { name: 'Voluntary Benefits (EX:Accident/CI/HI)', allowMultiple: false },
      P: { name: 'EAP', allowMultiple: false },
      Q: { name: 'Additional Perks and Other Programs (EX:Fedlogic/LSA)', allowMultiple: false }
    };
  }

  extractChangedFlags(formData) {
    const flags = {};
    const sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q'];
    
    sections.forEach(section => {
      flags[section] = formData[`section_${section}_changed`] === 'yes';
    });
    
    return flags;
  }

  extractIncludedFlags(formData) {
    const flags = {};
    const sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q'];
    
    sections.forEach(section => {
      flags[section] = formData[`section_${section}_include_in_guide`] === 'yes';
    });
    
    return flags;
  }

  processSectionsData(formData) {
    const sectionsData = {};
    const sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q'];
    
    sections.forEach(section => {
      if (formData[`section_${section}_changed`] === 'yes') {
        // All sections now use the same simplified structure
        const changeDescription = formData[`${section.toLowerCase()}_change_description`];
        if (changeDescription && changeDescription.trim() !== '') {
          sectionsData[section] = {
            change_description: changeDescription.trim()
          };
        }
      }
    });
    
    return sectionsData;
  }



  // DELETE /intakes/:intakeId - Delete intake
  async delete(req, res) {
    try {
      const { intakeId } = req.params;
      
      // Delete associated section details
      this.sectionModel.deleteByIntakeId(intakeId);
      
      // Delete associated uploads
      const uploads = this.uploadModel.getByIntakeId(intakeId);
      uploads.forEach(upload => {
        // Delete physical file
        const fs = require('fs');
        const path = require('path');
        try {
          const filePath = path.join(__dirname, '..', upload.stored_path);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          console.warn('Failed to delete file:', upload.stored_path, err.message);
        }
        
        // Delete upload record
        this.uploadModel.delete(upload.id);
      });
      
      // Delete the intake
      const success = this.intakeModel.delete(intakeId);
      
      if (success) {
        res.json({ success: true, message: 'Intake deleted successfully' });
      } else {
        res.status(404).json({ error: 'Intake not found' });
      }
      
    } catch (error) {
      console.error('Delete intake error:', error);
      res.status(500).json({ error: 'Failed to delete intake' });
    }
  }
}

module.exports = IntakeController;
