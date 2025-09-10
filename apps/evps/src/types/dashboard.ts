export interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface ChartConfig {
  title: string;
  description: string;
  data: ChartDataPoint[];
  lastUpdated: string;
}

export interface DashboardData {
  ageDistribution: ChartConfig;
  careerStage: ChartConfig;
  lifeStage: ChartConfig;
}

export interface InsightData {
  id: string;
  text: string;
  generatedAt: Date;
  isEdited?: boolean;
  chartType: string;
  chartTitle: string;
}