
export interface Equipment {
  id: string;
  name: string;
  type: string;
  flowrate: number;
  pressure: number;
  temperature: number;
}

export interface SummaryStats {
  totalCount: number;
  avgFlowrate: number;
  avgPressure: number;
  avgTemperature: number;
  typeDistribution: Record<string, number>;
}

export interface DatasetHistory {
  id: string;
  timestamp: string;
  filename: string;
  data: Equipment[];
  summary: SummaryStats;
}

export interface User {
  username: string;
  isAuthenticated: boolean;
}
