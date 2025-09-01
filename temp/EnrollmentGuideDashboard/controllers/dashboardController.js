const IntakeModel = require('../models/intake');
const UploadModel = require('../models/upload');

class DashboardController {
  constructor() {
    this.intakeModel = new IntakeModel();
    this.uploadModel = new UploadModel();
  }

  // GET /dashboard - Show dashboard
  async showDashboard(req, res) {
    try {
      const filters = this.parseFilters(req.query);
      const intakes = this.intakeModel.getAll(filters);
      const stats = this.intakeModel.getStats();
      
      // Get unique values for filter dropdowns
      const allIntakes = this.intakeModel.getAll();
      const filterOptions = this.extractFilterOptions(allIntakes);

      res.render('dashboard', {
        title: 'Employee Communications Request Dashboard',
        intakes,
        stats,
        filters,
        filterOptions,
        currentSort: filters.sort || 'date_received',
        currentOrder: filters.order || 'desc'
      });
      
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).render('error', {
        error: 'Dashboard Error',
        message: 'Unable to load dashboard data'
      });
    }
  }

  // GET /dashboard/export.csv - Export to CSV
  async exportCSV(req, res) {
    try {
      const filters = this.parseFilters(req.query);
      const intakes = this.intakeModel.getAll(filters);
      
      const csvData = this.generateCSV(intakes);
      const filename = `enrollment_intakes_${new Date().toISOString().split('T')[0]}.csv`;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvData);
      
    } catch (error) {
      console.error('CSV Export error:', error);
      res.status(500).json({ error: 'Failed to export data' });
    }
  }

  // Helper methods
  parseFilters(query) {
    const filters = {};
    
    // Status filter (can be multiple)
    if (query.status) {
      filters.status = Array.isArray(query.status) ? query.status : [query.status];
    }
    
    // Complexity filter (can be multiple)
    if (query.complexity) {
      filters.complexity = Array.isArray(query.complexity) ? query.complexity : [query.complexity];
    }
    
    // Requestor search
    if (query.requestor && query.requestor.trim()) {
      filters.requestor = query.requestor.trim();
    }
    
    // Plan year filter
    if (query.plan_year && !isNaN(query.plan_year)) {
      filters.plan_year = parseInt(query.plan_year);
    }
    
    // Production time filter (can be multiple)
    if (query.production_time) {
      filters.production_time = Array.isArray(query.production_time) ? query.production_time : [query.production_time];
    }
    
    // Sorting
    if (query.sort) {
      filters.sort = query.sort;
    }
    
    if (query.order) {
      filters.order = query.order;
    }
    
    return filters;
  }

  extractFilterOptions(intakes) {
    const options = {
      statuses: ['NOT_STARTED', 'STARTED', 'ROADBLOCK', 'READY_FOR_QA', 'DELIVERED_TO_CONSULTANT'],
      complexities: ['Minimal', 'Low', 'Medium', 'High'],
      requestors: [...new Set(intakes.map(i => i.requestor_name))].sort(),
      planYears: [...new Set(intakes.map(i => i.plan_year))].sort((a, b) => b - a),
      productionTimes: ['Rush', 'Standard']
    };
    
    return options;
  }

  generateCSV(intakes) {
    const headers = [
      'Intake ID',
      'Client Name',
      'Requestor Name',
      'Plan Year',
      'Guide Type',
      'Communications Add Ons',
      'Status',
      'Complexity Band',
      'Complexity Score',
      'Date Received',
      'Sections Changed',
      'Payroll Storage URL',
      'General Notes',
      'Created At',
      'Updated At'
    ];
    
    const csvRows = [headers.join(',')];
    
    intakes.forEach(intake => {
      const sectionsChanged = Object.entries(intake.sections_changed_flags)
        .filter(([_, changed]) => changed)
        .map(([section, _]) => section)
        .join(';');
        
      const row = [
        this.escapeCsv(intake.intake_id),
        this.escapeCsv(intake.client_name),
        this.escapeCsv(intake.requestor_name),

        intake.plan_year,
        this.escapeCsv(intake.guide_type || ''),
        this.escapeCsv(intake.communications_add_ons || ''),
        intake.status,
        intake.complexity_band,
        intake.complexity_score,
        intake.date_received,
        this.escapeCsv(sectionsChanged),
        this.escapeCsv(intake.payroll_storage_url || ''),
        this.escapeCsv(intake.notes_general || ''),
        intake.created_at,
        intake.updated_at
      ];
      
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }

  escapeCsv(field) {
    if (field === null || field === undefined) {
      return '';
    }
    
    const stringField = String(field);
    
    // If field contains comma, newline, or quote, wrap in quotes and escape internal quotes
    if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    
    return stringField;
  }

  getStatusColor(status) {
    const colors = {
      'NOT_STARTED': 'bg-gray-100 text-gray-800',
      'STARTED': 'bg-blue-100 text-blue-800',
      'ROADBLOCK': 'bg-red-100 text-red-800',
      'READY_FOR_QA': 'bg-yellow-100 text-yellow-800',
      'DELIVERED_TO_CONSULTANT': 'bg-green-100 text-green-800'
    };
    
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getComplexityColor(complexity) {
    const colors = {
      'Minimal': 'bg-green-100 text-green-800',
      'Low': 'bg-blue-100 text-blue-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-red-100 text-red-800'
    };
    
    return colors[complexity] || 'bg-gray-100 text-gray-800';
  }

  // GET /dashboard/stats - Get stats for AJAX updates
  async getStats(req, res) {
    try {
      const stats = this.intakeModel.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Stats API error:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }
}

module.exports = DashboardController;
