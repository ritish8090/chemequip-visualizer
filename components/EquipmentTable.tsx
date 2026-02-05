
import React, { useState, useMemo } from 'react';
import { Equipment } from '../types';
import { Search, ChevronUp, ChevronDown, AlertTriangle, X, Gauge, Activity, Thermometer, Download } from 'lucide-react';

interface EquipmentTableProps {
  data: Equipment[];
  pressureThreshold: number;
  setPressureThreshold: (val: number) => void;
  isSimulating: boolean;
  isDark: boolean;
  onGeneratePDF: () => void;
}

const EquipmentTable: React.FC<EquipmentTableProps> = ({ 
  data, 
  pressureThreshold, 
  setPressureThreshold,
  isSimulating,
  isDark,
  onGeneratePDF
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEqId, setSelectedEqId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Equipment, direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });

  const processedData = useMemo(() => {
    let result = [...data];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(item => item.name.toLowerCase().includes(lower) || item.type.toLowerCase().includes(lower));
    }
    result.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [data, searchTerm, sortConfig]);

  const selectedEq = data.find(e => e.id === selectedEqId);

  return (
    <div className="relative">
      <div className={`rounded-[2.5rem] shadow-sm border overflow-hidden transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
        <div className={`p-10 border-b space-y-8 print-hidden ${isDark ? 'border-zinc-800' : 'border-zinc-50'}`}>
          <div className="flex flex-wrap gap-8 items-center">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="text"
                placeholder="Locate operational unit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-14 pr-6 py-4.5 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm ${isDark ? 'bg-zinc-950 border-zinc-800 text-white focus:bg-zinc-900' : 'bg-zinc-50 border-zinc-100 text-zinc-900 focus:bg-white'}`}
              />
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={onGeneratePDF}
                className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${isDark ? 'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-500' : 'bg-zinc-900 text-white shadow-zinc-300 hover:bg-zinc-800'}`}
              >
                <Download size={18} className="animate-bounce" />
                Download PDF
              </button>
            </div>

            <div className={`flex items-center gap-6 px-8 py-4 rounded-2xl border min-w-[380px] ${isDark ? 'bg-amber-900/10 border-amber-900/30' : 'bg-amber-50 border-amber-100'}`}>
              <AlertTriangle className="text-amber-500 shrink-0" size={20} />
              <div className="flex-1">
                <div className="flex justify-between items-baseline mb-3">
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-amber-500' : 'text-amber-800'}`}>Critical Limit: {pressureThreshold} bar</span>
                </div>
                <input 
                  type="range" min="10" max="100" value={pressureThreshold}
                  onChange={(e) => setPressureThreshold(+e.target.value)}
                  className="w-full h-1 bg-amber-500/20 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className={`text-[10px] uppercase tracking-[0.25em] font-black border-b ${isDark ? 'bg-zinc-950 text-zinc-600 border-zinc-800' : 'bg-zinc-50 text-zinc-400 border-zinc-50'}`}>
              <tr>
                <th className="px-10 py-6 cursor-pointer hover:text-blue-500 transition-colors" onClick={() => setSortConfig({ key: 'name', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>Registry Unit</th>
                <th className="px-10 py-6">Flow Trend</th>
                <th className="px-10 py-6">Pressure</th>
                <th className="px-10 py-6">Temp</th>
                <th className="px-10 py-6">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-zinc-800' : 'divide-zinc-50'}`}>
              {processedData.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => setSelectedEqId(item.id)}
                  className={`cursor-pointer transition-all duration-300 group ${selectedEqId === item.id ? (isDark ? 'bg-blue-600/10' : 'bg-blue-50') : (isDark ? 'hover:bg-zinc-800/50' : 'hover:bg-zinc-50/50')}`}
                >
                  <td className="px-10 py-7">
                    <p className={`font-black text-sm tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'} group-hover:text-blue-500`}>{item.name}</p>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter mt-1">{item.type}</p>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-5">
                      <span className={`text-sm font-black tabular-nums w-14 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{item.flowrate}</span>
                      <Sparkline data={item.history?.flow || []} color="#3b82f6" />
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-5">
                      <span className={`text-sm font-black tabular-nums w-12 ${item.pressure > pressureThreshold ? 'text-rose-500' : isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{item.pressure}</span>
                      <Sparkline data={item.history?.press || []} color={item.pressure > pressureThreshold ? '#f43f5e' : '#6366f1'} />
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <span className={`text-sm font-black tabular-nums ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{item.temperature}°C</span>
                  </td>
                  <td className="px-10 py-7">
                    <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase inline-flex items-center gap-2.5 transition-colors ${item.pressure > pressureThreshold ? (isDark ? 'bg-rose-500/10 text-rose-500' : 'bg-rose-100 text-rose-700') : (isDark ? 'bg-blue-500/10 text-blue-500' : 'bg-blue-100 text-blue-700')}`}>
                      <div className={`w-2 h-2 rounded-full ${item.pressure > pressureThreshold ? 'bg-rose-500 animate-pulse' : 'bg-blue-500'}`}></div>
                      {item.pressure > pressureThreshold ? 'Critical' : 'Stable'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      {selectedEq && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-300 print:hidden">
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md" onClick={() => setSelectedEqId(null)}></div>
          <div className={`relative w-full max-w-xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
            <div className={`p-12 border-b flex items-center justify-between transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50 border-zinc-100'}`}>
              <div>
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-2 block">Analytical Profile</span>
                <h3 className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-zinc-900'}`}>{selectedEq.name}</h3>
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{selectedEq.type}</span>
              </div>
              <button onClick={() => setSelectedEqId(null)} className={`p-4 rounded-2xl transition-all ${isDark ? 'hover:bg-zinc-800 text-zinc-500' : 'hover:bg-zinc-200 text-zinc-400'}`}>
                <X size={32} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
              <div className="grid grid-cols-2 gap-8">
                <DetailGauge label="Flowrate" value={selectedEq.flowrate} unit="L/h" icon={<Activity />} color="text-blue-500" isDark={isDark} />
                <DetailGauge label="Pressure" value={selectedEq.pressure} unit="bar" icon={<Gauge />} color={selectedEq.pressure > pressureThreshold ? 'text-rose-500' : 'text-amber-500'} isDark={isDark} />
                <DetailGauge label="Temperature" value={selectedEq.temperature} unit="°C" icon={<Thermometer />} color="text-indigo-500" isDark={isDark} />
                <div className={`p-8 rounded-[2rem] transition-colors ${isDark ? 'bg-zinc-950' : 'bg-zinc-900 text-white'}`}>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Integrity Sync</p>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-5xl font-black ${isDark ? 'text-white' : 'text-white'}`}>94</p>
                    <span className="text-sm font-black text-blue-400">%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Sensor Stream (Last 20s)</h4>
                <div className={`h-56 rounded-[2rem] flex items-end p-8 gap-2 border transition-colors ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-100'}`}>
                  {(selectedEq.history?.flow || []).map((v, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-blue-500/10 rounded-t-xl transition-all duration-300 border-t-2 border-blue-500" 
                      style={{ height: `${(v / 5000) * 100}%` }}
                    ></div>
                  ))}
                </div>
              </div>

              <div className={`rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden transition-all ${isDark ? 'bg-blue-600 shadow-blue-500/20' : 'bg-zinc-900 shadow-zinc-500/20'}`}>
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 -m-12 rounded-full blur-3xl"></div>
                <h4 className="font-black text-xl mb-4 tracking-tight">AI Diagnostic Protocol</h4>
                <p className="text-sm font-medium text-white/70 leading-relaxed">
                  Unit operational profile remains within baseline parameters. Neural detection shows no drift patterns. 
                  Next preventative window: <span className="text-white underline decoration-2 underline-offset-4">Oct 24, 2025</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Sparkline = ({ data, color }: { data: number[], color: string }) => {
  if (data.length < 2) return <div className="w-24 h-4 bg-zinc-800/20 rounded-full" />;
  const max = Math.max(...data) || 1;
  const min = Math.min(...data) || 0;
  const range = (max - min) || 1;
  
  return (
    <svg className="w-28 h-10 overflow-visible" preserveAspectRatio="none">
      <path
        fill="none"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d={`M ${data.map((v, i) => `${(i / (data.length - 1)) * 112},${40 - ((v - min) / range) * 32}`).join(' L ')}`}
      />
    </svg>
  );
};

const DetailGauge = ({ label, value, unit, icon, color, isDark }: { label: string, value: number, unit: string, icon: any, color: string, isDark: boolean }) => (
  <div className={`p-8 rounded-[2rem] border transition-colors ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-100'}`}>
    <div className={`mb-4 ${color}`}>{React.cloneElement(icon, { size: 28 })}</div>
    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
    <div className="flex items-baseline gap-1">
      <span className={`text-4xl font-black tabular-nums tracking-tighter ${isDark ? 'text-white' : 'text-zinc-900'}`}>{value}</span>
      <span className="text-xs font-bold text-zinc-400">{unit}</span>
    </div>
  </div>
);

export default EquipmentTable;
