
export interface Equipment {
  id: string;
  name: string;
  type: string;
  flowrate: number;
  pressure: number;
  temperature: number;
  history?: {
    flow: number[];
    press: number[];
    temp: number[];
  };
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
  theme?: 'light' | 'dark';
}

export interface FilterState {
  minFlow: number;
  maxFlow: number;
  minPressure: number;
  maxPressure: number;
  pressureThreshold: number;
  selectedTypes: string[];
}

export interface Alarm {
  id: string;
  timestamp: string;
  equipmentName: string;
  parameter: string;
  value: number;
  severity: 'warning' | 'critical';
}
