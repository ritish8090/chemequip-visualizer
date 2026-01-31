
import React, { useState } from 'react';
import { Equipment } from '../types';
import { Search, Download, Filter } from 'lucide-react';

interface EquipmentTableProps {
  data: Equipment[];
  onDownloadReport: () => void;
}

const EquipmentTable: React.FC<EquipmentTableProps> = ({ data, onDownloadReport }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search equipment by name or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-medium">
            <Filter size={18} />
            Filter
          </button>
          <button 
            onClick={onDownloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md shadow-indigo-100"
          >
            <Download size={18} />
            Generate PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-6 py-4">Equipment Name</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Flowrate (L/h)</th>
              <th className="px-6 py-4">Pressure (bar)</th>
              <th className="px-6 py-4">Temp (°C)</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                <td className="px-6 py-4">
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-semibold">
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{item.flowrate}</td>
                <td className="px-6 py-4 text-slate-600">{item.pressure}</td>
                <td className="px-6 py-4 text-slate-600">{item.temperature}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${item.pressure > 40 ? 'bg-red-500' : 'bg-green-500'}`}></span>
                  <span className="text-xs font-medium text-slate-500">
                    {item.pressure > 40 ? 'High Pressure' : 'Normal'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredData.length === 0 && (
          <div className="py-20 text-center text-slate-400">
            <Search className="mx-auto mb-4 opacity-20" size={48} />
            No equipment found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentTable;
