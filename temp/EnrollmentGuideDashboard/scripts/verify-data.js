const Database = require('../config/database');
const IntakeModel = require('../models/intake');

const dbManager = new Database();
const intakeModel = new IntakeModel();

console.log('Checking database contents...');

try {
  const intakes = intakeModel.getAll({ sortBy: 'date_received', sortOrder: 'DESC' });
  
  console.log(`\nFound ${intakes.length} intake requests:\n`);
  
  intakes.forEach((intake, index) => {
    console.log(`${index + 1}. ${intake.intake_id} - ${intake.client_name}`);
    console.log(`   Status: ${intake.status}, Complexity: ${intake.complexity_band}`);
    console.log(`   Requestor: ${intake.requestor_name}`);
    console.log(`   Date: ${intake.date_received}\n`);
  });
  
} catch (error) {
  console.error('Error reading database:', error.message);
}

process.exit(0);