const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const pino = require('pino');

const logger = pino();

class DatabaseManager {
  constructor() {
    if (DatabaseManager.instance) {
      return DatabaseManager.instance;
    }
    
    const dbPath = path.join(__dirname, '../data/enrollment.db');
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    
    this.runMigrations();
    logger.info('Database initialized');
    
    DatabaseManager.instance = this;
  }

  runMigrations() {
    const migrationsDir = path.join(__dirname, '../migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    // Create migrations table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL UNIQUE,
        executed_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    const getExecutedMigrations = this.db.prepare('SELECT filename FROM migrations');
    const executedMigrations = new Set(getExecutedMigrations.all().map(row => row.filename));

    for (const migrationFile of migrationFiles) {
      if (!executedMigrations.has(migrationFile)) {
        logger.info(`Running migration: ${migrationFile}`);
        const migrationSQL = fs.readFileSync(path.join(migrationsDir, migrationFile), 'utf8');
        
        const transaction = this.db.transaction(() => {
          this.db.exec(migrationSQL);
          this.db.prepare('INSERT INTO migrations (filename) VALUES (?)').run(migrationFile);
        });
        
        transaction();
        logger.info(`Migration completed: ${migrationFile}`);
      }
    }
  }

  getInstance() {
    return this.db;
  }
}

module.exports = DatabaseManager;
