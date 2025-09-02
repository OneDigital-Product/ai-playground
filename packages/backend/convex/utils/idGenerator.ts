/**
 * Generates human-friendly intake IDs in the format EG-2025-xxxx
 */
export function generateIntakeId(): string {
  const now = new Date();
  const year = now.getFullYear();
  
  // Generate 4-character base36 suffix (1,296 combinations)
  const randomNum = Math.floor(Math.random() * Math.pow(36, 4));
  const suffix = randomNum.toString(36).toUpperCase().padStart(4, '0');
  
  return `EG-${year}-${suffix}`;
}

export interface IntakeIdParts {
  year: number;
  suffix: string;
}

/**
 * Parses an intake ID to extract components
 */
export function parseIntakeId(intakeId: string): IntakeIdParts {
  const match = intakeId.match(/^EG-(\d{4})-([A-Z0-9]{4})$/);
  if (!match) {
    throw new Error('Invalid intake ID format');
  }
  
  const [, yearString, suffix] = match;
  if (!yearString || !suffix) {
    throw new Error('Invalid intake ID format');
  }
  
  const year = parseInt(yearString, 10);
  
  return {
    year,
    suffix,
  };
}