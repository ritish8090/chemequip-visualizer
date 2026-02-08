
import React, { useRef, useState } from 'react';
import { Upload as UploadIcon, FileUp, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { mockApi } from '../services/mockApi';

interface UploadProps {
  onUploadSuccess: (filename: string, content: string, fileBlob?: File) => void;
  isDark: boolean;
}

const Upload: React.FC<UploadProps> = ({ onUploadSuccess, isDark }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setError('Structure Violation: CSV file type mandated.');
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
      setTimeout(() => { 
        onUploadSuccess(file.name, content, file);
        setIsUploading(false);
      }, 1000);
    };
    reader.onerror = () => {
      setError('Transmission Error: Stream integrity lost.');
      setIsUploading(false);
    };
    reader.readAsText(file);
  };

  const handleUseSample = () => {
    const sample = mockApi.getSampleData();
    onUploadSuccess('production_baseline_v2.csv', sample);
  };

  return (
    <div className="max-w-4xl mx-auto py-20">
      <div className={`rounded-[3rem] shadow-2xl p-16 text-center relative overflow-hidden transition-colors border ${isDark ? 'bg-zinc-900 border-zinc-800 shadow-blue-500/5' : 'bg-white border-zinc-100 shadow-zinc-200'}`}>
        <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600"></div>
        <div className="mb-16">
          <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner transition-colors ${isDark ? 'bg-zinc-950' : 'bg-blue-50'}`}>
            <FileUp className="text-blue-600" size={48} />
          </div>
          <h2 className={`text-5xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-zinc-900'}`}>Data Ingestion</h2>
          <p className="text-zinc-500 mt-4 font-medium text-xl">Upload equipment matrix for neural parameter mapping.</p>
        </div>

        <div 
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-4 border-dashed rounded-[3rem] p-24 transition-all cursor-pointer group relative overflow-hidden ${
            isUploading ? 'bg-zinc-950 border-zinc-800 cursor-not-allowed' : (isDark ? 'border-zinc-800 hover:border-blue-500 hover:bg-zinc-800/50' : 'border-blue-100 hover:border-blue-500 hover:bg-blue-50/50')
          }`}
        >
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" disabled={isUploading} />
          {isUploading ? (
            <div className="flex flex-col items-center gap-8">
              <div className="w-20 h-20 border-8 border-blue-600 border-t-transparent rounded-full animate-spin shadow-xl"></div>
              <p className="text-blue-500 font-black uppercase tracking-[0.3em] text-xs">Decrypting CSV Matrix...</p>
            </div>
          ) : (
            <div className="space-y-8">
              <UploadIcon className={`mx-auto transition-all transform group-hover:scale-110 ${isDark ? 'text-zinc-800 group-hover:text-blue-500' : 'text-blue-200 group-hover:text-blue-500'}`} size={72} />
              <div>
                <p className={`text-3xl font-black ${isDark ? 'text-zinc-400 group-hover:text-white' : 'text-zinc-800'}`}>Push Data Stream</p>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-4">Mandatory Headers: name, type, flow, press, temp</p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-10 flex items-center justify-center gap-4 text-rose-500 bg-rose-500/10 p-6 rounded-3xl border border-rose-500/30">
            <AlertCircle size={28} />
            <span className="font-black uppercase tracking-tight text-sm">{error}</span>
          </div>
        )}

        <div className={`mt-16 pt-16 border-t flex flex-col items-center ${isDark ? 'border-zinc-800' : 'border-zinc-50'}`}>
          <p className="text-[10px] text-zinc-500 mb-8 font-black uppercase tracking-[0.4em]">Baseline Reference</p>
          <button 
            onClick={handleUseSample}
            className={`flex items-center gap-4 px-12 py-6 rounded-2xl transition-all font-black text-sm shadow-2xl active:scale-95 ${isDark ? 'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-500' : 'bg-zinc-900 text-white shadow-zinc-300 hover:bg-zinc-800'}`}
          >
            <FileSpreadsheet size={22} className={isDark ? 'text-blue-200' : 'text-blue-500'} />
            LOAD NEURAL BASELINE
          </button>
        </div>
      </div>
    </div>
  );
};

export default Upload;
