// Section definitions mapping
export const SECTION_DEFINITIONS = {
  A: "Eligibility",
  B: "Enrollment", 
  C: "Benefits Administration",
  D: "Medical- Plans and Plan Designs",
  E: "Medical- Deductible Support (EX:HRA/HSA)",
  F: "Medical- Spending Accounts (EX:FSA/LPFSA/DCA)",
  G: "Medical- Telehealth",
  H: "Dental",
  I: "Vision",
  J: "Life/AD&D",
  K: "Voluntary Life/AD&D", 
  L: "Short Term Disability",
  M: "Long Term Disability",
  N: "Statutory Leave",
  O: "Voluntary Benefits (EX:Accident/CI/HI)",
  P: "EAP",
  Q: "Additional Perks and Other Programs (EX:Fedlogic/LSA)"
} as const;

export type SectionCode = keyof typeof SECTION_DEFINITIONS;

export const getAllSectionCodes = (): SectionCode[] => {
  return Object.keys(SECTION_DEFINITIONS) as SectionCode[];
};

export const getSectionName = (code: SectionCode): string => {
  return SECTION_DEFINITIONS[code];
};

// Get sections that are marked as true in a flags object
export const getSectionsFromFlags = (flags: Record<string, boolean>): SectionCode[] => {
  return Object.entries(flags)
    .filter(([, included]) => included)
    .map(([code]) => code as SectionCode)
    .sort();
};