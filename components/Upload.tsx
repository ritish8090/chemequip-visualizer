
import React, { useRef, useState } from 'react';
import { Upload as UploadIcon, FileUp, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { mockApi } from '../services/mockApi';

interface UploadProps {
  onUploadSuccess: (filename: string, content: string) => void;
}

const Upload: React.FC<UploadProps> = ({ onUploadSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setError('Only CSV files are supported.');
        return;
      }
      
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setIsUploading(true);
    setError(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setTimeout(() => { // Simulate API delay
        onUploadSuccess(file.name, content);
        setIsUploading(false);
      }, 1000);
    };
    reader.onerror = () => {
      setError('Failed to read file.');
      setIsUploading(false);
    };
    reader.readAsText(file);
  };

  const handleUseSample = () => {
    const sample = mockApi.getSampleData();
    onUploadSuccess('sample_equipment_data.csv', sample);
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-10 border border-slate-100 text-center">
        <div className="mb-8">
          <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileUp className="text-indigo-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Import Chemical Equipment Data</h2>
          <p className="text-slate-500 mt-2">Upload your CSV file to generate analysis and summaries.</p>
        </div>

        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer group ${
            isUploading ? 'bg-slate-50 border-slate-200 cursor-not-allowed' : 'border-indigo-100 hover:border-indigo-400 hover:bg-indigo-50/30'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
            disabled={isUploading}
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-600 font-medium">Processing Dataset...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <UploadIcon className="mx-auto text-indigo-300 group-hover:text-indigo-600 transition-colors" size={48} />
              <div>
                <p className="text-lg font-bold text-slate-700">Click to Browse or Drop File</p>
                <p className="text-sm text-slate-400">Supported format: CSV (Equipment, Type, Flowrate, Pressure, Temperature)</p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 flex items-center justify-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
            <AlertCircle size={20} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div className="mt-10 pt-10 border-t border-slate-100">
          <p className="text-sm text-slate-400 mb-4 font-medium uppercase tracking-widest">Don't have a file?</p>
          <button 
            onClick={handleUseSample}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors font-bold"
          >
            <FileSpreadsheet size={20} />
            Use sample_equipment_data.csv
          </button>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <UploadFeature icon={<CheckCircle className="text-green-500" />} title="Auto Analysis" desc="Summary statistics generated instantly." />
        <UploadFeature icon={<CheckCircle className="text-green-500" />} title="Visualization" desc="Beautiful charts from your raw data." />
        <UploadFeature icon={<CheckCircle className="text-green-500" />} title="History" desc="Keep track of your last 5 uploads." />
      </div>
    </div>
  );
};

const UploadFeature = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="flex flex-col items-center text-center">
    <div className="mb-2">{icon}</div>
    <h4 className="font-bold text-slate-800">{title}</h4>
    <p className="text-xs text-slate-500">{desc}</p>
  </div>
);

export default Upload;
