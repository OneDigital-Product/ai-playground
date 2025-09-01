const Database = require('../config/database');
const IntakeModel = require('../models/intake');

const dbManager = new Database();
const intakeModel = new IntakeModel();

async function updateStatuses() {
  try {
    console.log('Updating sample statuses...');
    
    // Get all intakes
    const intakes = intakeModel.getAll({ sortBy: 'date_received', sortOrder: 'DESC' });
    
    if (intakes.length >= 6) {
      // Update different statuses to show variety
      intakeModel.updateStatus(intakes[0].intake_id, 'STARTED');
      console.log(`Updated ${intakes[0].client_name} to STARTED`);
      
      intakeModel.updateStatus(intakes[1].intake_id, 'READY_FOR_QA');
      console.log(`Updated ${intakes[1].client_name} to READY_FOR_QA`);
      
      intakeModel.updateStatus(intakes[2].intake_id, 'DELIVERED_TO_CONSULTANT');
      console.log(`Updated ${intakes[2].client_name} to DELIVERED_TO_CONSULTANT`);
      
      intakeModel.updateStatus(intakes[3].intake_id, 'NOT_STARTED');
      console.log(`Updated ${intakes[3].client_name} to NOT_STARTED`);
      
      intakeModel.updateStatus(intakes[4].intake_id, 'ROADBLOCK');
      console.log(`Updated ${intakes[4].client_name} to ROADBLOCK`);
      
      intakeModel.updateStatus(intakes[5].intake_id, 'STARTED');
      console.log(`Updated ${intakes[5].client_name} to STARTED`);
    }
    
    console.log('Status updates completed!');
    
  } catch (error) {
    console.error('Error updating statuses:', error);
  }
  
  process.exit(0);
}

updateStatuses();