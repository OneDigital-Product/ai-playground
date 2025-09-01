const Database = require('../config/database');
const IntakeModel = require('../models/intake');

// Initialize database connection
const dbManager = new Database();
const intakeModel = new IntakeModel();

const sampleIntakes = [
  {
    client_name: 'TechCorp Solutions',
    plan_year: 2025,
    requestor_name: 'Sarah Johnson',
    requestor_email: 'sarah.johnson@techcorp.com',
    status: 'STARTED',
    complexity_band: 'MODERATE',
    complexity_score: 45,
    sections_changed_flags: {C: true, D: true, E: false, F: false, G: false, H: false, I: false},
    notes_general: 'Client wants to switch from BCBS to Aetna for medical and dental. Need new plan documents.',
    date_received: '2025-01-10 09:15:00'
  },
  {
    client_name: 'Meridian Financial Group',
    plan_year: 2025,
    requestor_name: 'Mike Chen',
    requestor_email: 'mchen@meridianfg.com',
    status: 'READY_FOR_QA',
    complexity_band: 'SIGNIFICANT',
    complexity_score: 78,
    sections_changed_flags: {C: true, D: true, E: true, F: true, G: false, H: true, I: false},
    notes_general: 'Complete benefits overhaul - new carriers for medical, dental, vision, life and FSA. High priority client.',
    date_received: '2025-01-08 14:30:00'
  },
  {
    client_name: 'GreenLeaf Manufacturing',
    plan_year: 2025,
    requestor_name: 'Lisa Rodriguez',
    requestor_email: 'l.rodriguez@greenleaf.com',
    status: 'NOT_STARTED',
    complexity_band: 'LOW',
    complexity_score: 25,
    sections_changed_flags: {C: false, D: true, E: false, F: false, G: false, H: false, I: false},
    notes_general: 'Simple dental carrier change from Delta to MetLife. Should be straightforward.',
    date_received: '2025-01-12 11:45:00'
  },
  {
    client_name: 'Coastal Logistics Inc',
    plan_year: 2025,
    requestor_name: 'David Park',
    requestor_email: 'dpark@coastallogistics.com',
    status: 'DELIVERED_TO_CONSULTANT',
    complexity_band: 'MINIMAL',
    complexity_score: 15,
    sections_changed_flags: {C: false, D: false, E: true, F: false, G: false, H: false, I: false},
    notes_general: 'Adding vision coverage through VSP. No other changes needed.',
    date_received: '2025-01-05 16:20:00'
  },
  {
    client_name: 'Pinnacle Healthcare Services',
    plan_year: 2025,
    requestor_name: 'Jennifer Walsh',
    requestor_email: 'jennifer.walsh@pinnacle-health.com',
    status: 'ROADBLOCK',
    complexity_band: 'SIGNIFICANT',
    complexity_score: 82,
    sections_changed_flags: {C: true, D: true, E: true, F: true, G: true, H: true, I: true},
    notes_general: 'Complete benefits redesign blocked - waiting on carrier quotes and plan documents. All sections affected.',
    date_received: '2025-01-07 10:00:00'
  },
  {
    client_name: 'Riverside Community College',
    plan_year: 2025,
    requestor_name: 'Robert Kim',
    requestor_email: 'rkim@riverside.edu',
    status: 'STARTED',
    complexity_band: 'MODERATE',
    complexity_score: 52,
    sections_changed_flags: {C: true, D: false, E: false, F: true, G: true, H: false, I: false},
    notes_general: 'Educational institution updating medical plan and adding new disability and EAP benefits.',
    date_received: '2025-01-09 13:15:00'
  }
];

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    for (const intake of sampleIntakes) {
      try {
        const result = intakeModel.create(intake);
        console.log(`Created intake: ${result.intake_id} for ${intake.client_name}`);
      } catch (error) {
        console.error(`Failed to create intake for ${intake.client_name}:`, error.message);
      }
    }
    
    console.log('Database seeding completed!');
    console.log(`Created ${sampleIntakes.length} sample intake requests.`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close database connection
    process.exit(0);
  }
}

// Run the seeding
seedDatabase();