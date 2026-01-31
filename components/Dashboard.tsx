
import React from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Scatter } from 'react-chartjs-2';
import { Equipment, SummaryStats } from '../types';
import { Activity, Thermometer, Gauge, Box } from 'lucide-react';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement, 
  PointElement,
  LineElement,
  Title, 
  Tooltip, 
  Legend
);

interface DashboardProps {
  data: Equipment[];
  summary: SummaryStats;
}

const Dashboard: React.FC<DashboardProps> = ({ data, summary }) => {
  const typeLabels = Object.keys(summary.typeDistribution);
  const typeValues = Object.values(summary.typeDistribution);

  const barData = {
    labels: ['Flowrate (L/h)', 'Pressure (bar)', 'Temp (°C)'],
    datasets: [{
      label: 'Average Values',
      data: [summary.avgFlowrate, summary.avgPressure, summary.avgTemperature],
      backgroundColor: ['rgba(79, 70, 229, 0.7)', 'rgba(236, 72, 153, 0.7)', 'rgba(245, 158, 11, 0.7)'],
      borderRadius: 8,
    }]
  };

  const pieData = {
    labels: typeLabels,
    datasets: [{
      data: typeValues,
      backgroundColor: [
        '#4F46E5', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'
      ],
      borderWidth: 0,
    }]
  };

  const scatterData = {
    datasets: [{
      label: 'Pressure vs Flowrate',
      data: data.map(eq => ({ x: eq.flowrate, y: eq.pressure })),
      backgroundColor: 'rgba(79, 70, 229, 0.8)',
    }]
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Box />} label="Total Equipment" value={summary.totalCount} color="bg-indigo-500" />
        <StatCard icon={<Activity />} label="Avg Flowrate" value={`${summary.avgFlowrate} L/h`} color="bg-pink-500" />
        <StatCard icon={<Gauge />} label="Avg Pressure" value={`${summary.avgPressure} bar`} color="bg-amber-500" />
        <StatCard icon={<Thermometer />} label="Avg Temp" value={`${summary.avgTemperature} °C`} color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Equipment Type Distribution</h3>
          <div className="h-[300px] flex justify-center">
            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Average Parameters Summary</h3>
          <div className="h-[300px]">
            <Bar data={barData} options={{ 
              maintainAspectRatio: false,
              plugins: { legend: { display: false } }
            }} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Correlation: Pressure vs Flowrate</h3>
          <div className="h-[300px]">
            <Scatter 
              data={scatterData} 
              options={{ 
                maintainAspectRatio: false,
                scales: {
                  x: { title: { display: true, text: 'Flowrate (L/h)' } },
                  y: { title: { display: true, text: 'Pressure (bar)' } }
                }
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
    <div className={`${color} p-3 rounded-xl text-white`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

export default Dashboard;
