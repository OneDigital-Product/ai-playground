const Database = require('../config/database');

class SectionModel {
  constructor() {
    const dbManager = new Database();
    this.db = dbManager.getInstance();
    
    this.createStmt = this.db.prepare(`
      INSERT INTO section_details (intake_id, section_code, payload)
      VALUES (?, ?, ?)
    `);
    
    this.updateStmt = this.db.prepare(`
      UPDATE section_details 
      SET payload = ? 
      WHERE intake_id = ? AND section_code = ?
    `);
    
    this.getByIntakeStmt = this.db.prepare('SELECT * FROM section_details WHERE intake_id = ? ORDER BY section_code');
    this.getBySectionStmt = this.db.prepare('SELECT * FROM section_details WHERE intake_id = ? AND section_code = ?');
    this.deleteStmt = this.db.prepare('DELETE FROM section_details WHERE intake_id = ? AND section_code = ?');
  }

  create(sectionData) {
    try {
      const payload = typeof sectionData.payload === 'string' 
        ? sectionData.payload 
        : JSON.stringify(sectionData.payload);
        
      const result = this.createStmt.run(
        sectionData.intake_id,
        sectionData.section_code,
        payload
      );
      
      return this.getBySection(sectionData.intake_id, sectionData.section_code);
    } catch (error) {
      throw new Error(`Failed to create section: ${error.message}`);
    }
  }

  upsert(sectionData) {
    try {
      const payload = typeof sectionData.payload === 'string' 
        ? sectionData.payload 
        : JSON.stringify(sectionData.payload);
        
      // Check if record exists
      const existing = this.getBySectionStmt.get(sectionData.intake_id, sectionData.section_code);
      
      if (existing) {
        // Update existing record
        this.updateStmt.run(payload, sectionData.intake_id, sectionData.section_code);
        return this.getBySection(sectionData.intake_id, sectionData.section_code);
      } else {
        // Create new record
        return this.create(sectionData);
      }
    } catch (error) {
      throw new Error(`Failed to upsert section: ${error.message}`);
    }
  }

  getByIntakeId(intake_id) {
    try {
      const results = this.getByIntakeStmt.all(intake_id);
      return results.map(result => ({
        ...result,
        payload: JSON.parse(result.payload)
      }));
    } catch (error) {
      throw new Error(`Failed to fetch sections for intake: ${error.message}`);
    }
  }

  deleteByIntakeId(intake_id) {
    try {
      const deleteAllStmt = this.db.prepare('DELETE FROM section_details WHERE intake_id = ?');
      const result = deleteAllStmt.run(intake_id);
      return result.changes;
    } catch (error) {
      throw new Error(`Failed to delete sections for intake: ${error.message}`);
    }
  }

  getBySection(intake_id, section_code) {
    try {
      const result = this.getBySectionStmt.get(intake_id, section_code);
      if (result) {
        result.payload = JSON.parse(result.payload);
      }
      return result;
    } catch (error) {
      throw new Error(`Failed to fetch section: ${error.message}`);
    }
  }

  delete(intake_id, section_code) {
    try {
      const result = this.deleteStmt.run(intake_id, section_code);
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Failed to delete section: ${error.message}`);
    }
  }

  getOrganizedSections(intake_id) {
    try {
      const sections = this.getByIntakeId(intake_id);
      const organized = {
        A: null, // Eligibility
        B: null, // Personal Information
        C: null, // Medical
        D: null, // Dental  
        E: null, // Vision
        F: null, // Life & AD&D
        G: null, // Disability
        H: null, // FSAs and DCAs
        I: null, // EAP & Other Programs
        J: null, // HSA
        K: null, // Transportation
        L: null, // Legal Services  
        M: null, // Identity Theft
        N: null, // Employee Discounts
        O: null, // Wellness Programs
        P: null, // Pet Insurance
        Q: null  // Additional Perks
      };

      sections.forEach(section => {
        const baseCode = section.section_code.charAt(0);
        // All sections are now single sections (no more multi-plan arrays)
        organized[baseCode] = section;
      });

      return organized;
    } catch (error) {
      throw new Error(`Failed to organize sections: ${error.message}`);
    }
  }

  bulkCreate(intake_id, sectionsData) {
    try {
      const transaction = this.db.transaction(() => {
        // Clear existing sections for this intake
        const clearStmt = this.db.prepare('DELETE FROM section_details WHERE intake_id = ?');
        clearStmt.run(intake_id);

        // Insert new sections
        for (const [section_code, payload] of Object.entries(sectionsData)) {
          if (payload && Object.keys(payload).length > 0) {
            this.createStmt.run(intake_id, section_code, JSON.stringify(payload));
          }
        }
      });

      transaction();
      return this.getByIntakeId(intake_id);
    } catch (error) {
      throw new Error(`Failed to bulk create sections: ${error.message}`);
    }
  }
}

module.exports = SectionModel;
