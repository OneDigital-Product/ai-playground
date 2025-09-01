const Database = require('../config/database');
const fs = require('fs');
const path = require('path');

class UploadModel {
  constructor() {
    const dbManager = new Database();
    this.db = dbManager.getInstance();
    
    this.createStmt = this.db.prepare(`
      INSERT INTO uploads (intake_id, kind, original_name, mime_type, bytes, stored_path)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    this.getByIntakeStmt = this.db.prepare('SELECT * FROM uploads WHERE intake_id = ? ORDER BY created_at DESC');
    this.getByIdStmt = this.db.prepare('SELECT * FROM uploads WHERE id = ?');
    this.deleteStmt = this.db.prepare('DELETE FROM uploads WHERE id = ?');
  }

  create(uploadData) {
    try {
      const result = this.createStmt.run(
        uploadData.intake_id,
        uploadData.kind,
        uploadData.original_name,
        uploadData.mime_type,
        uploadData.bytes,
        uploadData.stored_path
      );
      
      return this.getById(result.lastInsertRowid);
    } catch (error) {
      throw new Error(`Failed to create upload record: ${error.message}`);
    }
  }

  getById(id) {
    try {
      return this.getByIdStmt.get(id);
    } catch (error) {
      throw new Error(`Failed to fetch upload: ${error.message}`);
    }
  }

  getByIntakeId(intake_id) {
    try {
      return this.getByIntakeStmt.all(intake_id);
    } catch (error) {
      throw new Error(`Failed to fetch uploads for intake: ${error.message}`);
    }
  }

  delete(id) {
    try {
      const upload = this.getById(id);
      if (!upload) {
        return false;
      }

      // Delete physical file
      const filePath = path.join(__dirname, '..', upload.stored_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete database record
      const result = this.deleteStmt.run(id);
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Failed to delete upload: ${error.message}`);
    }
  }

  getFileStats() {
    try {
      const statsStmt = this.db.prepare(`
        SELECT 
          kind,
          COUNT(*) as count,
          SUM(bytes) as total_bytes,
          AVG(bytes) as avg_bytes
        FROM uploads 
        GROUP BY kind
      `);
      
      return statsStmt.all();
    } catch (error) {
      throw new Error(`Failed to get file stats: ${error.message}`);
    }
  }

  cleanup(intake_id) {
    try {
      const uploads = this.getByIntakeId(intake_id);
      let deletedCount = 0;

      for (const upload of uploads) {
        if (this.delete(upload.id)) {
          deletedCount++;
        }
      }

      return deletedCount;
    } catch (error) {
      throw new Error(`Failed to cleanup uploads: ${error.message}`);
    }
  }
}

module.exports = UploadModel;
