
import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import EquipmentTable from './components/EquipmentTable';
import Upload from './components/Upload';
import History from './components/History';
import { User, DatasetHistory } from './types';
import { mockApi } from './services/mockApi';

const App: React.FC = () => {
  const [user, setUser] = useState<User>({ username: '', isAuthenticated: false });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'table' | 'upload'>('upload');
  const [history, setHistory] = useState<DatasetHistory[]>([]);
  const [activeDatasetId, setActiveDatasetId] = useState<string | null>(null);

  useEffect(() => {
    const loadedHistory = mockApi.getHistory();
    setHistory(loadedHistory);
    if (loadedHistory.length > 0) {
      setActiveDatasetId(loadedHistory[0].id);
      setActiveTab('dashboard');
    }
  }, []);

  const handleLogin = (username: string) => {
    setUser({ username, isAuthenticated: true });
  };

  const handleLogout = () => {
    setUser({ username: '', isAuthenticated: false });
  };

  const handleUploadSuccess = (filename: string, content: string) => {
    const newDataset = mockApi.processCSV(filename, content);
    setHistory(prev => [newDataset, ...prev].slice(0, 5));
    setActiveDatasetId(newDataset.id);
    setActiveTab('dashboard');
  };

  const activeDataset = history.find(h => h.id === activeDatasetId);

  const downloadPDFReport = () => {
    if (!activeDataset) return;
    alert(`Generating PDF Report for ${activeDataset.filename}...\n(In a real app, jsPDF would trigger a download here)`);
  };

  if (!user.isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <Layout 
      username={user.username} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 min-w-0">
          {activeTab === 'upload' && (
            <Upload onUploadSuccess={handleUploadSuccess} />
          )}

          {activeTab === 'dashboard' && activeDataset && (
            <Dashboard 
              data={activeDataset.data} 
              summary={activeDataset.summary} 
            />
          )}

          {activeTab === 'table' && activeDataset && (
            <EquipmentTable 
              data={activeDataset.data} 
              onDownloadReport={downloadPDFReport} 
            />
          )}

          {activeTab !== 'upload' && !activeDataset && (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-slate-500 font-medium">Please upload a dataset to view this page.</p>
              <button 
                onClick={() => setActiveTab('upload')}
                className="mt-4 text-indigo-600 font-bold hover:underline"
              >
                Go to Import Data
              </button>
            </div>
          )}
        </div>

        {/* Sidebar History Panel */}
        <div className="xl:w-80 w-full shrink-0">
          <History 
            history={history} 
            activeId={activeDatasetId} 
            onSelect={(id) => {
              setActiveDatasetId(id);
              if (activeTab === 'upload') setActiveTab('dashboard');
            }} 
          />
          
          {/* Quick Stats Sidebar (Only if dataset active) */}
          {activeDataset && (
            <div className="mt-6 bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Live Summary</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-300">File</span>
                  <span className="text-sm font-bold truncate max-w-[120px]">{activeDataset.filename}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-300">Rows</span>
                  <span className="text-sm font-bold">{activeDataset.summary.totalCount}</span>
                </div>
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-slate-400">Process Efficiency</span>
                    <span className="text-xs text-indigo-400">92%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className="bg-indigo-500 h-1.5 rounded-full w-[92%]"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default App;
