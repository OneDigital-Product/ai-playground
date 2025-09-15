// Shared demo dataset for EVPS charts (color-agnostic).
// Apps should apply theme-driven colors (e.g., var(--chart-*) tokens).

const evpsDemoData = {
  ageDistribution: {
    title: "Age Distribution",
    description: "Demographic breakdown by age groups from EVPS survey (n=4,939)",
    data: [
      { name: "35-44", value: 28.6 },
      { name: "45-54", value: 24.3 },
      { name: "26-34", value: 23.8 },
      { name: "55-64", value: 17.5 },
      { name: "18-25", value: 3.4 },
      { name: "65+", value: 2.4 },
    ],
    lastUpdated: "2025-01-10T10:30:00Z",
  },
  careerStage: {
    title: "Career Stage Distribution",
    description: "Employee career progression levels from EVPS survey (n=4,939)",
    data: [
      { name: "Advanced", value: 25.2 },
      { name: "Management", value: 24.6 },
      { name: "Intermediate", value: 19.4 },
      { name: "Executive", value: 15.5 },
      { name: "Support/Administrative", value: 8.0 },
      { name: "Entry", value: 7.3 },
    ],
    lastUpdated: "2025-01-10T09:15:00Z",
  },
  lifeStage: {
    title: "Life Stage Distribution",
    description: "Personal life circumstances of survey respondents (n=4,939)",
    data: [
      { name: "Married with Children", value: 42.97 },
      { name: "Dual Income", value: 24.25 },
      { name: "Single over 45", value: 14.5 },
      { name: "Single under 45", value: 11.95 },
      { name: "Single Parents", value: 5.33 },
    ],
    lastUpdated: "2025-01-10T08:45:00Z",
  },
} as const;

export default evpsDemoData;

