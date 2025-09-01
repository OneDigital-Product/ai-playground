function calculateComplexity(intakeData) {
  let score = 0;
  
  // Base score starts at 0
  
  // +1 for each section marked as changed
  const sectionsChanged = intakeData.sections_changed_flags || {};
  const changedSections = Object.values(sectionsChanged).filter(Boolean);
  score += changedSections.length * 1;
  
  // Guide Type scoring
  if (intakeData.guide_type === 'New Guide Build') {
    score += 15;
  } else if (intakeData.guide_type === 'Update Existing Guide') {
    score += 0; // Explicitly 0 points
  }
  
  // Communications Add Ons scoring
  if (intakeData.communications_add_ons === 'OE Letter') {
    score += 3;
  } else if (intakeData.communications_add_ons === 'OE Presentation') {
    score += 5;
  } else if (intakeData.communications_add_ons === 'Both') {
    score += 10;
  }
  // 'None' and 'Other' implicitly add 0 points
  
  // Map score to complexity band
  let band;
  if (score <= 3) {
    band = 'Minimal';
  } else if (score <= 8) {
    band = 'Low';
  } else if (score <= 15) {
    band = 'Medium';
  } else {
    band = 'High';
  }
  
  return { score, band };
}

function getComplexityColor(complexity) {
  const colors = {
    'Minimal': 'status-minimal',
    'Low': 'status-low',
    'Medium': 'status-moderate', 
    'High': 'status-high'
  };
  
  return colors[complexity] || 'bg-gray-100 text-gray-800';
}

function getStatusColor(status) {
  const colors = {
    'NOT_STARTED': 'bg-gray-100 text-gray-800',
    'STARTED': 'bg-blue-100 text-blue-800',
    'ROADBLOCK': 'bg-red-100 text-red-800',
    'READY_FOR_QA': 'bg-yellow-100 text-yellow-800',
    'DELIVERED_TO_CONSULTANT': 'bg-green-100 text-green-800'
  };
  
  return colors[status] || 'bg-gray-100 text-gray-800';
}

module.exports = {
  calculateComplexity,
  getComplexityColor,
  getStatusColor
};
