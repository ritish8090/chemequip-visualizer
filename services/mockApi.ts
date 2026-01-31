
import { Equipment, SummaryStats, DatasetHistory } from '../types';

const STORAGE_KEY = 'chem_equip_history';

export const mockApi = {
  // Simulate the Django analysis logic
  processCSV: (filename: string, rawData: string): DatasetHistory => {
    const lines = rawData.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const equipmentData: Equipment[] = lines.slice(1).map((line, index) => {
      const cols = line.split(',').map(c => c.trim());
      return {
        id: `eq-${Date.now()}-${index}`,
        name: cols[0] || 'Unknown',
        type: cols[1] || 'General',
        flowrate: parseFloat(cols[2]) || 0,
        pressure: parseFloat(cols[3]) || 0,
        temperature: parseFloat(cols[4]) || 0,
      };
    });

    const summary = mockApi.calculateSummary(equipmentData);
    
    const newDataset: DatasetHistory = {
      id: `ds-${Date.now()}`,
      timestamp: new Date().toISOString(),
      filename,
      data: equipmentData,
      summary
    };

    const history = mockApi.getHistory();
    const updatedHistory = [newDataset, ...history].slice(0, 5);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));

    return newDataset;
  },

  calculateSummary: (data: Equipment[]): SummaryStats => {
    if (data.length === 0) return {
      totalCount: 0,
      avgFlowrate: 0,
      avgPressure: 0,
      avgTemperature: 0,
      typeDistribution: {}
    };

    const totalCount = data.length;
    const sums = data.reduce((acc, curr) => ({
      flow: acc.flow + curr.flowrate,
      pres: acc.pres + curr.pressure,
      temp: acc.temp + curr.temperature,
    }), { flow: 0, pres: 0, temp: 0 });

    const dist: Record<string, number> = {};
    data.forEach(item => {
      dist[item.type] = (dist[item.type] || 0) + 1;
    });

    return {
      totalCount,
      avgFlowrate: +(sums.flow / totalCount).toFixed(2),
      avgPressure: +(sums.pres / totalCount).toFixed(2),
      avgTemperature: +(sums.temp / totalCount).toFixed(2),
      typeDistribution: dist
    };
  },

  getHistory: (): DatasetHistory[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  getSampleData: () => {
    return `Equipment Name,Type,Flowrate,Pressure,Temperature
Centrifugal Pump A,Pump,450.5,12.4,85.0
Heat Exchanger X1,Heat Exchanger,1200.0,4.5,145.2
Storage Tank T101,Tank,0.0,1.2,25.0
Reactor R-202,Reactor,850.0,45.0,210.5
Control Valve V-01,Valve,320.4,15.8,40.0
Distillation Column D1,Column,2500.0,2.5,180.0
Centrifugal Pump B,Pump,480.2,13.1,88.5
Reactor R-203,Reactor,890.0,42.5,215.0`;
  }
};
