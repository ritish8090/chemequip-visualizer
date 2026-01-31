
import React from 'react';
import { History as HistoryIcon, Clock, ChevronRight, FileText } from 'lucide-react';
import { DatasetHistory } from '../types';

interface HistoryProps {
  history: DatasetHistory[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

const History: React.FC<HistoryProps> = ({ history, activeId, onSelect }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center gap-2 mb-6">
        <HistoryIcon className="text-indigo-600" size={20} />
        <h3 className="text-lg font-bold text-slate-800">Upload History</h3>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="mx-auto text-slate-300 mb-2" size={32} />
          <p className="text-slate-400 text-sm">No datasets uploaded yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${
                activeId === item.id 
                  ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100' 
                  : 'border-slate-100 bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`${activeId === item.id ? 'bg-indigo-600' : 'bg-slate-300'} p-2 rounded-lg text-white`}>
                  <FileText size={18} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 truncate max-w-[150px]">{item.filename}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(item.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                </div>
              </div>
              <ChevronRight className={`transition-transform ${activeId === item.id ? 'text-indigo-600 translate-x-1' : 'text-slate-300'}`} size={18} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
