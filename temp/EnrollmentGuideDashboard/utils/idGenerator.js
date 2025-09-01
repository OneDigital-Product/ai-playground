function generateIntakeId() {
  const now = new Date();
  const dateString = now.getFullYear().toString() + 
                    (now.getMonth() + 1).toString().padStart(2, '0') + 
                    now.getDate().toString().padStart(2, '0');
  
  // Generate 4-character base36 suffix (1,296 combinations)
  const randomNum = Math.floor(Math.random() * Math.pow(36, 4));
  const suffix = randomNum.toString(36).toUpperCase().padStart(4, '0');
  
  return `INTAKE-${dateString}-${suffix}`;
}

function parseIntakeId(intakeId) {
  const match = intakeId.match(/^INTAKE-(\d{8})-([A-Z0-9]{4})$/);
  if (!match) {
    throw new Error('Invalid intake ID format');
  }
  
  const [, dateString, suffix] = match;
  const year = parseInt(dateString.substr(0, 4));
  const month = parseInt(dateString.substr(4, 2)) - 1; // Month is 0-indexed
  const day = parseInt(dateString.substr(6, 2));
  
  return {
    date: new Date(year, month, day),
    suffix,
    dateString
  };
}

module.exports = {
  generateIntakeId,
  parseIntakeId
};
