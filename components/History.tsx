
import React from 'react';
import { History as HistoryIcon, Clock, ChevronRight, FileText } from 'lucide-react';
import { DatasetHistory } from '../types';

interface HistoryProps {
  history: DatasetHistory[];
  activeId: string | null;
  onSelect: (id: string) => void;
  isDark: boolean;
}

const History: React.FC<HistoryProps> = ({ history, activeId, onSelect, isDark }) => {
  return (
    <div className={`p-10 rounded-[2.5rem] border shadow-sm transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
      <div className="flex items-center gap-3 mb-10">
        <HistoryIcon className="text-blue-500" size={24} />
        <h3 className={`text-xl font-black tracking-tighter uppercase ${isDark ? 'text-white' : 'text-zinc-900'}`}>Registry</h3>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16">
          <Clock className={`mx-auto mb-6 opacity-20 ${isDark ? 'text-zinc-600' : 'text-zinc-300'}`} size={48} />
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">No Logs Detected</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full text-left p-6 rounded-3xl border transition-all flex items-center justify-between group ${
                activeId === item.id 
                  ? 'border-blue-600 bg-blue-600/5 shadow-xl shadow-blue-500/5' 
                  : isDark ? 'border-zinc-800 bg-zinc-950 hover:border-zinc-700' : 'border-zinc-50 bg-zinc-50 hover:border-zinc-200'
              }`}
            >
              <div className="flex items-center gap-5">
                <div className={`${activeId === item.id ? 'bg-blue-600' : isDark ? 'bg-zinc-800' : 'bg-zinc-200'} p-3.5 rounded-2xl text-white transition-all shadow-inner`}>
                  <FileText size={20} />
                </div>
                <div className="overflow-hidden">
                  <p className={`font-black truncate text-sm ${activeId === item.id ? (isDark ? 'text-white' : 'text-zinc-900') : (isDark ? 'text-zinc-400' : 'text-zinc-600')}`}>{item.filename}</p>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter mt-1">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Sync
                  </p>
                </div>
              </div>
              <ChevronRight className={`transition-transform duration-300 ${activeId === item.id ? 'text-blue-500 translate-x-1' : 'text-zinc-300'}`} size={20} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
