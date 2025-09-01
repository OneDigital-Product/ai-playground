const Database = require('../config/database');
const { generateIntakeId } = require('../utils/idGenerator');
const { calculateComplexity } = require('../utils/complexity');

class IntakeModel {
  constructor() {
    const dbManager = new Database();
    this.db = dbManager.getInstance();
    
    // Prepared statements
    this.createStmt = this.db.prepare(`
      INSERT INTO intakes (
        intake_id, client_name, plan_year, requestor_name,
        sections_changed_flags, sections_included_flags, payroll_storage_url, guide_type, communications_add_ons, requested_production_time, notes_general,
        complexity_score, complexity_band
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    this.getByIdStmt = this.db.prepare('SELECT * FROM intakes WHERE intake_id = ?');
    this.getAllStmt = this.db.prepare('SELECT * FROM intakes ORDER BY date_received DESC');
    this.updateStatusStmt = this.db.prepare('UPDATE intakes SET status = ? WHERE intake_id = ?');
    this.updateStmt = this.db.prepare(`
      UPDATE intakes SET 
        client_name = ?, plan_year = ?, requestor_name = ?,
        sections_changed_flags = ?, sections_included_flags = ?, payroll_storage_url = ?, guide_type = ?, communications_add_ons = ?, requested_production_time = ?, notes_general = ?
      WHERE intake_id = ?
    `);
  }

  async create(intakeData) {
    try {
      const intake_id = generateIntakeId();
      const sectionsFlags = JSON.stringify(intakeData.sections_changed_flags || {
        A: false, B: false, C: false, D: false, E: false, F: false, G: false, 
        H: false, I: false, J: false, K: false, L: false, M: false, N: false, 
        O: false, P: false, Q: false
      });
      
      const sectionsIncludedFlags = JSON.stringify(intakeData.sections_included_flags || {
        A: true, B: true, C: true, D: true, E: true, F: true, G: true, 
        H: true, I: true, J: true, K: true, L: true, M: true, N: true, 
        O: true, P: true, Q: true
      });
      
      // Calculate complexity score and band
      const { score, band } = calculateComplexity(intakeData);
      
      const result = this.createStmt.run(
        intake_id,
        intakeData.client_name,
        intakeData.plan_year,
        intakeData.requestor_name,
        sectionsFlags,
        sectionsIncludedFlags,
        intakeData.payroll_storage_url || null,
        intakeData.guide_type || null,
        intakeData.communications_add_ons || null,
        intakeData.requested_production_time || null,
        intakeData.notes_general || null,
        score,
        band
      );
      
      return this.getById(intake_id);
    } catch (error) {
      throw new Error(`Failed to create intake: ${error.message}`);
    }
  }

  getById(intake_id) {
    try {
      const result = this.getByIdStmt.get(intake_id);
      if (result) {
        result.sections_changed_flags = JSON.parse(result.sections_changed_flags);
        result.sections_included_flags = JSON.parse(result.sections_included_flags || '{}');
      }
      return result;
    } catch (error) {
      throw new Error(`Failed to fetch intake: ${error.message}`);
    }
  }

  getAll(filters = {}) {
    try {
      let query = 'SELECT * FROM intakes WHERE 1=1';
      const params = [];

      if (filters.status && filters.status.length > 0) {
        const placeholders = filters.status.map(() => '?').join(',');
        query += ` AND status IN (${placeholders})`;
        params.push(...filters.status);
      }

      if (filters.complexity && filters.complexity.length > 0) {
        const placeholders = filters.complexity.map(() => '?').join(',');
        query += ` AND complexity_band IN (${placeholders})`;
        params.push(...filters.complexity);
      }

      if (filters.requestor) {
        query += ' AND requestor_name LIKE ?';
        params.push(`%${filters.requestor}%`);
      }

      if (filters.plan_year) {
        query += ' AND plan_year = ?';
        params.push(filters.plan_year);
      }
      
      if (filters.production_time && filters.production_time.length > 0) {
        const placeholders = filters.production_time.map(() => '?').join(',');
        query += ` AND requested_production_time IN (${placeholders})`;
        params.push(...filters.production_time);
      }

      // Add sorting
      const validSortColumns = ['client_name', 'requestor_name', 'guide_type', 'communications_add_ons', 'complexity_band', 'date_received', 'status', 'requested_production_time'];
      const sortBy = validSortColumns.includes(filters.sort) ? filters.sort : 'date_received';
      const sortOrder = filters.order === 'asc' ? 'ASC' : 'DESC';
      query += ` ORDER BY ${sortBy} ${sortOrder}`;

      const stmt = this.db.prepare(query);
      const results = stmt.all(params);
      
      return results.map(result => ({
        ...result,
        sections_changed_flags: JSON.parse(result.sections_changed_flags),
        sections_included_flags: JSON.parse(result.sections_included_flags || '{}')
      }));
    } catch (error) {
      throw new Error(`Failed to fetch intakes: ${error.message}`);
    }
  }

  updateStatus(intake_id, status) {
    try {
      const result = this.updateStatusStmt.run(status, intake_id);
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Failed to update status: ${error.message}`);
    }
  }

  update(intake_id, intakeData) {
    try {
      const sectionsFlags = JSON.stringify(intakeData.sections_changed_flags);
      const sectionsIncludedFlags = JSON.stringify(intakeData.sections_included_flags || {});
      
      const result = this.updateStmt.run(
        intakeData.client_name,
        intakeData.plan_year,
        intakeData.requestor_name,
        sectionsFlags,
        sectionsIncludedFlags,
        intakeData.payroll_storage_url || null,
        intakeData.guide_type || null,
        intakeData.communications_add_ons || null,
        intakeData.requested_production_time || null,
        intakeData.notes_general || null,
        intake_id
      );
      
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Failed to update intake: ${error.message}`);
    }
  }

  delete(intake_id) {
    try {
      const deleteStmt = this.db.prepare('DELETE FROM intakes WHERE intake_id = ?');
      const result = deleteStmt.run(intake_id);
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Failed to delete intake: ${error.message}`);
    }
  }

  getStats() {
    try {
      const stats = {
        total: 0,
        by_status: {},
        by_complexity: {},
        recent_count: 0
      };

      // Total count
      const totalStmt = this.db.prepare('SELECT COUNT(*) as count FROM intakes');
      stats.total = totalStmt.get().count;

      // By status
      const statusStmt = this.db.prepare('SELECT status, COUNT(*) as count FROM intakes GROUP BY status');
      statusStmt.all().forEach(row => {
        stats.by_status[row.status] = row.count;
      });

      // By complexity
      const complexityStmt = this.db.prepare('SELECT complexity_band, COUNT(*) as count FROM intakes GROUP BY complexity_band');
      complexityStmt.all().forEach(row => {
        stats.by_complexity[row.complexity_band] = row.count;
      });

      // Recent (last 7 days)
      const recentStmt = this.db.prepare(`
        SELECT COUNT(*) as count FROM intakes 
        WHERE date_received >= datetime('now', '-7 days')
      `);
      stats.recent_count = recentStmt.get().count;

      return stats;
    } catch (error) {
      throw new Error(`Failed to get stats: ${error.message}`);
    }
  }
}

module.exports = IntakeModel;
