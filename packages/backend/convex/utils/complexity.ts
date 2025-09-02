export interface SectionsFlags {
  A: boolean;
  B: boolean;
  C: boolean;
  D: boolean;
  E: boolean;
  F: boolean;
  G: boolean;
  H: boolean;
  I: boolean;
  J: boolean;
  K: boolean;
  L: boolean;
  M: boolean;
  N: boolean;
  O: boolean;
  P: boolean;
  Q: boolean;
}

export interface ComplexityInput {
  sections_changed_flags?: SectionsFlags;
  guide_type?: 'Update Existing Guide' | 'New Guide Build';
  // During migration, support both older string values and new array with objects
  communications_add_ons?:
    | ('None' | 'OE Letter' | 'OE Presentation' | 'Both' | 'Other')
    | Array<
        | 'None'
        | 'Both'
        | 'OE Letter'
        | 'OE Presentation'
        | 'Other'
        | { type: 'Other'; text: string }
      >;
}

export interface ComplexityResult {
  score: number;
  band: 'Minimal' | 'Low' | 'Medium' | 'High';
}

/**
 * Calculates complexity score and band based on intake data
 */
export function calculateComplexity(intakeData: ComplexityInput): ComplexityResult {
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
  
  // Communications Add Ons scoring (supports string or array during transition)
  const arr = Array.isArray(intakeData.communications_add_ons)
    ? intakeData.communications_add_ons
    : (intakeData.communications_add_ons ? [intakeData.communications_add_ons] : []);

  const hasLetter = arr.some((v) => v === 'OE Letter');
  const hasPres = arr.some((v) => v === 'OE Presentation');

  if (hasLetter && hasPres) {
    score += 10; // Both
  } else if (hasPres) {
    score += 5; // OE Presentation
  } else if (hasLetter) {
    score += 3; // OE Letter
  }
  // 'None' and 'Other' add 0 points
  
  // Map score to complexity band
  let band: 'Minimal' | 'Low' | 'Medium' | 'High';
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

/**
 * Get CSS class for complexity band styling
 */
export function getComplexityColor(complexity: string): string {
  const colors = {
    'Minimal': 'status-minimal',
    'Low': 'status-low',
    'Medium': 'status-moderate', 
    'High': 'status-high'
  };
  
  return colors[complexity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
}

/**
 * Get CSS class for status styling
 */
export function getStatusColor(status: string): string {
  const colors = {
    'NOT_STARTED': 'bg-gray-100 text-gray-800',
    'STARTED': 'bg-blue-100 text-blue-800',
    'ROADBLOCK': 'bg-red-100 text-red-800',
    'READY_FOR_QA': 'bg-yellow-100 text-yellow-800',
    'DELIVERED_TO_CONSULTANT': 'bg-green-100 text-green-800'
  };
  
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
}