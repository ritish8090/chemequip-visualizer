
import React, { useMemo } from 'react';
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
import { Equipment, SummaryStats, FilterState } from '../types';
import { Activity, Thermometer, Gauge, Box, SlidersHorizontal, Zap, ZapOff, Filter, FileText, Download } from 'lucide-react';

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
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  isSimulating: boolean;
  setIsSimulating: (val: boolean) => void;
  availableTypes: string[];
  isDark: boolean;
  onGeneratePDF: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  data, 
  summary, 
  filters, 
  setFilters, 
  isSimulating, 
  setIsSimulating,
  availableTypes,
  isDark,
  onGeneratePDF
}) => {
  const chartColors = useMemo(() => ({
    text: isDark ? '#a1a1aa' : '#71717a',
    grid: isDark ? '#27272a' : '#f4f4f5',
    primary: '#2563eb',
    accent: '#f59e0b',
    danger: '#e11d48',
    series: ['#2563eb', '#f59e0b', '#6366f1', '#06b6d4', '#8b5cf6', '#ec4899']
  }), [isDark]);

  const toggleType = (type: string) => {
    setFilters(prev => {
      const selectedTypes = prev.selectedTypes.includes(type)
        ? prev.selectedTypes.filter(t => t !== type)
        : [...prev.selectedTypes, type];
      return { ...prev, selectedTypes };
    });
  };

  const pieData = {
    labels: Object.keys(summary.typeDistribution),
    datasets: [{
      data: Object.values(summary.typeDistribution),
      backgroundColor: chartColors.series,
      borderWidth: 0,
      hoverOffset: 15
    }]
  };

  const scatterData = {
    datasets: [{
      label: 'Asset Performance',
      data: data.map(eq => ({ x: eq.flowrate, y: eq.pressure })),
      backgroundColor: (context: any) => {
        const index = context.dataIndex;
        const eq = data[index];
        return eq && eq.pressure > filters.pressureThreshold ? chartColors.danger : chartColors.primary;
      },
      pointRadius: isSimulating ? 6 : 4,
    }]
  };

  const commonOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: chartColors.text,
          font: { weight: 'bold', size: 10, family: 'Inter' },
          usePointStyle: true,
          boxWidth: 6
        }
      }
    },
    scales: {
      x: {
        grid: { color: chartColors.grid },
        ticks: { color: chartColors.text, font: { weight: 'bold', size: 10 } }
      },
      y: {
        grid: { color: chartColors.grid },
        ticks: { color: chartColors.text, font: { weight: 'bold', size: 10 } }
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 print-hidden">
        <div className={`lg:col-span-3 p-8 rounded-[2.5rem] border shadow-sm transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 text-blue-500 font-black">
              <SlidersHorizontal size={18} />
              <span className="uppercase tracking-[0.2em] text-[10px]">Neural Control Matrix</span>
            </div>
            <button 
              onClick={onGeneratePDF}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 ${isDark ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20' : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-zinc-200'}`}
            >
              <Download size={14} className="animate-bounce" />
              Download PDF Report
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <RangeInput 
              label="Flow Threshold" 
              value={filters.maxFlow} 
              max={5000} 
              unit="L/h"
              isDark={isDark}
              onChange={(val) => setFilters(f => ({ ...f, maxFlow: val }))} 
            />
            <RangeInput 
              label="Pressure Limit" 
              value={filters.maxPressure} 
              max={100} 
              unit="bar"
              isDark={isDark}
              onChange={(val) => setFilters(f => ({ ...f, maxPressure: val }))} 
            />
          </div>
          
          <div className={`mt-10 pt-8 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-50'}`}>
            <div className="flex items-center gap-2 mb-5">
              <Filter size={14} className="text-zinc-500" />
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Category isolation</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {availableTypes.map(type => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filters.selectedTypes.includes(type)
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : isDark ? 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={`p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-between relative overflow-hidden group transition-all transform hover:scale-[1.02] ${isDark ? 'bg-blue-600 text-white shadow-blue-500/20' : 'bg-zinc-900 text-white shadow-zinc-200'}`}>
          <div className="absolute top-0 right-0 -m-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
          <div>
            <h3 className="text-2xl font-black tracking-tighter mb-4">Live Testing</h3>
            <p className="text-white/60 text-xs font-medium leading-relaxed uppercase tracking-wider">
              Neural simulation for real-time stress analytics and threshold validation.
            </p>
          </div>
          <button 
            onClick={() => setIsSimulating(!isSimulating)}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black transition-all transform active:scale-95 ${
              isSimulating 
                ? 'bg-white text-blue-600 shadow-xl' 
                : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            {isSimulating ? <Zap size={20} className="animate-pulse" /> : <ZapOff size={20} />}
            {isSimulating ? 'SYNC ONLINE' : 'GO LIVE'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Box />} label="Units" value={summary.totalCount} color="bg-blue-600" isDark={isDark} />
        <StatCard icon={<Activity />} label="Flow" value={summary.avgFlowrate} unit="L/h" color="bg-amber-500" isDark={isDark} />
        <StatCard icon={<Gauge />} label="Press" value={summary.avgPressure} unit="bar" color="bg-indigo-500" isDark={isDark} />
        <StatCard icon={<Thermometer />} label="Temp" value={summary.avgTemperature} unit="°C" color="bg-rose-500" isDark={isDark} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`p-10 rounded-[2.5rem] border shadow-sm transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
          <h3 className={`text-[10px] font-black uppercase tracking-[0.25em] mb-10 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Fleet Mix</h3>
          <div className="h-[300px]">
            <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: chartColors.text, font: { family: 'Inter', weight: 'bold' }, usePointStyle: true, boxWidth: 6 } } } }} />
          </div>
        </div>
        
        <div className={`lg:col-span-2 p-10 rounded-[2.5rem] border shadow-sm transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
          <h3 className={`text-[10px] font-black uppercase tracking-[0.25em] mb-10 flex justify-between ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            <span>Asset Correlation Matrix</span>
            <div className="flex gap-6 print-hidden">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div> Optimal
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div> Critical
              </span>
            </div>
          </h3>
          <div className="h-[300px]">
            <Scatter data={scatterData} options={commonOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

const RangeInput = ({ label, value, max, unit, isDark, onChange }: { label: string, value: number, max: number, unit: string, isDark: boolean, onChange: (v: number) => void }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{label}</label>
      <span className={`text-xs font-black tabular-nums ${isDark ? 'text-white' : 'text-zinc-900'}`}>{value} {unit}</span>
    </div>
    <input 
      type="range" 
      min="0" 
      max={max} 
      value={value}
      onChange={(e) => onChange(+e.target.value)}
      className={`w-full accent-blue-600 h-1.5 rounded-lg appearance-none cursor-pointer transition-colors ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}
    />
  </div>
);

const StatCard = ({ icon, label, value, unit, color, isDark }: { icon: any, label: string, value: string | number, unit?: string, color: string, isDark: boolean }) => (
  <div className={`p-8 rounded-[2rem] border shadow-sm flex items-center gap-5 transition-all hover:translate-y-[-2px] ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
    <div className={`${color} p-4 rounded-2xl text-white shadow-xl shadow-opacity-20`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div>
      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <p className={`text-3xl font-black tabular-nums tracking-tighter ${isDark ? 'text-white' : 'text-zinc-900'}`}>{value}</p>
        {unit && <span className="text-[10px] font-black text-zinc-400 uppercase">{unit}</span>}
      </div>
    </div>
  </div>
);

export default Dashboard;
