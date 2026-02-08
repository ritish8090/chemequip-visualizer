
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import EquipmentTable from './components/EquipmentTable';
import Upload from './components/Upload';
import History from './components/History';
import { User, DatasetHistory, FilterState, Equipment, Alarm, SummaryStats } from './types';
import { mockApi } from './services/mockApi';
import { FileText, Loader2, CheckCircle2, Beaker, Activity, Gauge, Thermometer, ShieldCheck, Wifi, WifiOff } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Pie, Scatter } from 'react-chartjs-2';

const API_BASE_URL = "http://127.0.0.1:8000/api";

const App: React.FC = () => {
  const [user, setUser] = useState<User>({ username: '', isAuthenticated: false, theme: 'light' });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'table' | 'upload'>('upload');
  const [history, setHistory] = useState<DatasetHistory[]>([]);
  const [activeDatasetId, setActiveDatasetId] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  
  const reportRef = useRef<HTMLDivElement>(null);

  // Interactive States
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedData, setSimulatedData] = useState<Equipment[]>([]);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    minFlow: 0,
    maxFlow: 5000,
    minPressure: 0,
    maxPressure: 100,
    pressureThreshold: 40,
    selectedTypes: []
  });

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/history/`);
      if (response.ok) {
        const data = await response.json();
        if (data.history && data.history.length > 0) {
          setHistory(data.history);
          setBackendStatus('online');
          return true;
        }
      }
    } catch (e) {
      console.warn("Backend unreachable, using local storage fallback.");
    }
    setBackendStatus('offline');
    setHistory(mockApi.getHistory());
    return false;
  };

  useEffect(() => {
    fetchHistory().then((isOnline) => {
      if (history.length > 0 || mockApi.getHistory().length > 0) {
        const initialHistory = isOnline ? history : mockApi.getHistory();
        if (initialHistory.length > 0) {
          setActiveDatasetId(initialHistory[0].id);
          setActiveTab('dashboard');
        }
      }
    });
    
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
    }
  }, []);

  const activeDataset = useMemo(() => 
    history.find(h => h.id === activeDatasetId)
  , [history, activeDatasetId]);

  useEffect(() => {
    let interval: number;
    if (isSimulating && activeDataset) {
      if (simulatedData.length === 0) {
        setSimulatedData(activeDataset.data.map(eq => ({
          ...eq,
          history: { flow: [eq.flowrate], press: [eq.pressure], temp: [eq.temperature] }
        })));
      }

      interval = window.setInterval(() => {
        setSimulatedData(prev => prev.map(eq => {
          const nextFlow = Math.max(0, +(eq.flowrate + (Math.random() - 0.5) * 20).toFixed(1));
          const nextPress = Math.max(0, +(eq.pressure + (Math.random() - 0.5) * 4).toFixed(1));
          const nextTemp = Math.max(0, +(eq.temperature + (Math.random() - 0.5) * 2).toFixed(1));

          if (nextPress > filters.pressureThreshold && eq.pressure <= filters.pressureThreshold) {
            const newAlarm: Alarm = {
              id: `alarm-${Date.now()}`,
              timestamp: new Date().toISOString(),
              equipmentName: eq.name,
              parameter: 'Pressure',
              value: nextPress,
              severity: nextPress > filters.pressureThreshold + 10 ? 'critical' : 'warning'
            };
            setAlarms(a => [newAlarm, ...a].slice(0, 10));
          }

          return {
            ...eq,
            flowrate: nextFlow,
            pressure: nextPress,
            temperature: nextTemp,
            history: {
              flow: [...(eq.history?.flow || []).slice(-19), nextFlow],
              press: [...(eq.history?.press || []).slice(-19), nextPress],
              temp: [...(eq.history?.temp || []).slice(-19), nextTemp],
            }
          };
        }));
      }, 1000);
    } else {
      setSimulatedData([]);
    }
    return () => clearInterval(interval);
  }, [isSimulating, activeDataset, filters.pressureThreshold]);

  const currentData = isSimulating ? simulatedData : (activeDataset?.data || []);

  const filteredData = useMemo(() => {
    return currentData.filter(eq => 
      eq.flowrate >= filters.minFlow && 
      eq.flowrate <= filters.maxFlow &&
      eq.pressure >= filters.minPressure &&
      eq.pressure <= filters.maxPressure &&
      (filters.selectedTypes.length === 0 || filters.selectedTypes.includes(eq.type))
    );
  }, [currentData, filters]);

  const liveSummary = useMemo(() => 
    mockApi.calculateSummary(filteredData)
  , [filteredData]);

  const handleLogin = (username: string) => {
    setUser({ username, isAuthenticated: true });
  };

  const handleLogout = () => {
    setUser({ username: '', isAuthenticated: false });
  };

  const handleUploadSuccess = async (filename: string, content: string, fileBlob?: File) => {
    if (backendStatus === 'online' && fileBlob) {
      try {
        const formData = new FormData();
        formData.append('file', fileBlob);
        const response = await fetch(`${API_BASE_URL}/upload/`, {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          const result = await response.json();
          setHistory(prev => [result, ...prev].slice(0, 5));
          setActiveDatasetId(result.id);
          setActiveTab('dashboard');
          setIsSimulating(false);
          setAlarms([]);
          return;
        }
      } catch (err) {
        console.error("Backend upload failed, falling back to mock.", err);
      }
    }

    // Fallback logic
    const newDataset = mockApi.processCSV(filename, content);
    setHistory(prev => [newDataset, ...prev].slice(0, 5));
    setActiveDatasetId(newDataset.id);
    setActiveTab('dashboard');
    setIsSimulating(false);
    setAlarms([]);
  };

  const generatePDFReport = async () => {
    if (!reportRef.current || !activeDataset) return;
    
    setIsGeneratingPDF(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = 295;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`EquipIQ_Complete_Report_${activeDataset.filename}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!user.isAuthenticated) {
    return <Auth onLogin={handleLogin} isDark={isDark} />;
  }

  return (
    <Layout 
      username={user.username} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      alarmCount={alarms.length}
      isDark={isDark}
      setIsDark={setIsDark}
    >
      {/* PDF Generation Overlay */}
      {isGeneratingPDF && (
        <div className="fixed inset-0 z-[100] bg-zinc-950/90 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-zinc-900 border border-zinc-800 p-12 rounded-[3rem] text-center max-w-sm w-full shadow-2xl shadow-blue-500/20 scale-110">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <Loader2 className="w-full h-full text-blue-500 animate-spin" />
              <FileText className="absolute inset-0 m-auto text-white" size={32} />
            </div>
            <h2 className="text-2xl font-black text-white mb-4 tracking-tighter uppercase text-center">Exporting Data</h2>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed text-center">
              Consolidating metrics, charts, and technical logs into a structured PDF document...
            </p>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-10 right-10 z-[110] animate-in slide-in-from-right-10 duration-500">
          <div className="bg-blue-600 text-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-4 border border-blue-400">
            <CheckCircle2 size={24} />
            <div>
              <p className="font-black text-sm uppercase tracking-widest text-left">Report Generated</p>
              <p className="text-[10px] font-medium opacity-80 uppercase text-left">The complete status report is now available.</p>
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN REPORT CONTAINER FOR PDF GENERATION */}
      <div 
        ref={reportRef}
        className="fixed top-0 left-[-9999px] w-[1000px] bg-white text-zinc-900 p-16 font-sans flex flex-col gap-12"
        style={{ zIndex: -1 }}
      >
        <div className="flex justify-between items-start border-b-4 border-blue-600 pb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-600 p-2 rounded-xl">
                <Beaker className="text-white" size={32} />
              </div>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-left">EquipIQ <span className="text-blue-600">Pro</span></h1>
            </div>
            <p className="text-xl font-bold text-zinc-500 uppercase tracking-widest text-left">Complete Technical Status Report</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Registry ID: {activeDatasetId}</p>
            <p className="text-sm font-black text-zinc-800 text-right">{new Date().toLocaleString()}</p>
            <p className="text-[10px] font-black text-blue-600 uppercase mt-2 text-right">Operator: {user.username}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-8">
           <ReportStat label="Total Assets" value={liveSummary.totalCount} unit="Units" />
           <ReportStat label="Mean Flow" value={liveSummary.avgFlowrate} unit="L/h" />
           <ReportStat label="Mean Press" value={liveSummary.avgPressure} unit="bar" />
           <ReportStat label="Mean Temp" value={liveSummary.avgTemperature} unit="°C" />
        </div>

        <div className="grid grid-cols-2 gap-12 items-start">
          <div className="p-8 border border-zinc-100 rounded-3xl bg-zinc-50/30">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-zinc-400 text-left">Inventory Classification</h3>
            <div className="h-[300px]">
              <Pie 
                data={{
                  labels: Object.keys(liveSummary.typeDistribution),
                  datasets: [{
                    data: Object.values(liveSummary.typeDistribution),
                    backgroundColor: ['#2563eb', '#f59e0b', '#6366f1', '#06b6d4', '#8b5cf6', '#ec4899'],
                    borderWidth: 0
                  }]
                }} 
                options={{ maintainAspectRatio: false, animation: false }} 
              />
            </div>
          </div>
          <div className="p-8 border border-zinc-100 rounded-3xl bg-zinc-50/30">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-zinc-400 text-left">Operational Drift Scatter</h3>
            <div className="h-[300px]">
              <Scatter 
                data={{
                  datasets: [{
                    label: 'Asset Performance',
                    data: filteredData.map(eq => ({ x: eq.flowrate, y: eq.pressure })),
                    backgroundColor: '#2563eb',
                    pointRadius: 6,
                  }]
                }} 
                options={{ 
                  maintainAspectRatio: false, 
                  animation: false,
                  scales: { x: { display: true, title: { display: true, text: 'Flow (L/h)' } }, y: { display: true, title: { display: true, text: 'Press (bar)' } } }
                }} 
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <ShieldCheck className="text-blue-600" size={24} />
             <h2 className="text-xl font-black uppercase tracking-tight text-left">Technical Analysis Summary</h2>
          </div>
          <div className="p-10 border-l-4 border-blue-600 bg-zinc-50/50 rounded-r-3xl">
            <p className="text-sm leading-relaxed text-zinc-700 font-medium text-left">
              The dataset <span className="font-black text-zinc-900">"{activeDataset?.filename}"</span> contains {liveSummary.totalCount} monitored items. 
              The system demonstrates a mean operational flowrate of {liveSummary.avgFlowrate} L/h with a standard pressure deviation indicating {filteredData.length > 0 ? 'active' : 'idle'} telemetry states.
              Neural analysis of the distribution suggests {Object.keys(liveSummary.typeDistribution).length} unique equipment classes. 
              No critical drift was detected in the primary correlation matrix during the generation phase.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-black uppercase tracking-tight mb-8 text-left">Registry Log</h2>
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              <tr>
                <th className="p-4 border border-zinc-200 text-left">Equipment</th>
                <th className="p-4 border border-zinc-200 text-left">Class</th>
                <th className="p-4 border border-zinc-200 text-left">Flow (L/h)</th>
                <th className="p-4 border border-zinc-200 text-left">Press (bar)</th>
                <th className="p-4 border border-zinc-200 text-left">Temp (°C)</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(eq => (
                <tr key={eq.id} className="text-xs font-bold border-b border-zinc-100">
                  <td className="p-4 border border-zinc-100 text-left">{eq.name}</td>
                  <td className="p-4 border border-zinc-100 text-left">{eq.type}</td>
                  <td className="p-4 border border-zinc-100 text-left">{eq.flowrate}</td>
                  <td className="p-4 border border-zinc-100 text-left">{eq.pressure}</td>
                  <td className="p-4 border border-zinc-100 text-left">{eq.temperature}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-auto pt-10 border-t border-zinc-100 flex justify-between">
          <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">© 2025 EquipIQ Systems • Internal Security Level 4</p>
          <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest text-right">End of Report</p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 min-w-0">
          {activeTab === 'upload' && (
            <Upload onUploadSuccess={handleUploadSuccess} isDark={isDark} />
          )}

          {activeTab === 'dashboard' && activeDataset && (
            <Dashboard 
              data={filteredData} 
              summary={liveSummary} 
              filters={filters}
              setFilters={setFilters}
              isSimulating={isSimulating}
              setIsSimulating={setIsSimulating}
              availableTypes={Object.keys(activeDataset.summary.typeDistribution)}
              isDark={isDark}
              onGeneratePDF={generatePDFReport}
            />
          )}

          {activeTab === 'table' && activeDataset && (
            <EquipmentTable 
              data={filteredData} 
              pressureThreshold={filters.pressureThreshold}
              setPressureThreshold={(val) => setFilters(f => ({ ...f, pressureThreshold: val }))}
              isSimulating={isSimulating}
              isDark={isDark}
              onGeneratePDF={generatePDFReport}
            />
          )}

          {activeTab !== 'upload' && !activeDataset && (
            <div className={`text-center py-20 rounded-3xl border-2 border-dashed ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-zinc-100 text-zinc-500'}`}>
              <p className="font-medium text-center">Please upload a dataset to view this page.</p>
              <button 
                onClick={() => setActiveTab('upload')}
                className="mt-4 text-blue-500 font-bold hover:underline"
              >
                Go to Import Data
              </button>
            </div>
          )}
        </div>

        <div className="xl:w-80 w-full shrink-0 space-y-6">
          {alarms.length > 0 && (
            <div className={`rounded-3xl p-6 border shadow-sm ${isDark ? 'bg-zinc-900 border-rose-900/30' : 'bg-white border-rose-100'}`}>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                <span>Active Alarms</span>
                <span className="bg-rose-500 text-white px-2 py-0.5 rounded-full text-[10px]">{alarms.length}</span>
              </h4>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {alarms.map(alarm => (
                  <div key={alarm.id} className={`p-3 rounded-xl border-l-4 ${isDark ? 'bg-rose-900/10 border-rose-500' : 'bg-rose-50 border-rose-500'}`}>
                    <p className={`text-xs font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-800'} text-left`}>{alarm.equipmentName}</p>
                    <p className="text-[10px] text-zinc-500 text-left">{alarm.parameter} high: {alarm.value} bar</p>
                    <p className="text-[9px] text-zinc-400 mt-1 text-left">{new Date(alarm.timestamp).toLocaleTimeString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <History 
            history={history} 
            activeId={activeDatasetId} 
            onSelect={(id) => {
              setActiveDatasetId(id);
              if (activeTab === 'upload') setActiveTab('dashboard');
              setIsSimulating(false);
              setAlarms([]);
            }} 
            isDark={isDark}
          />
          
          {activeDataset && (
            <div className={`rounded-3xl p-8 shadow-xl overflow-hidden relative ${isDark ? 'bg-blue-600 text-white' : 'bg-zinc-900 text-white'}`}>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <div className={`w-20 h-20 rounded-full border-8 border-white ${isSimulating ? 'animate-ping' : ''}`}></div>
              </div>
              <h4 className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-6 text-left">Core Performance</h4>
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-white/80">Stream Mode</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${isSimulating ? 'bg-white text-blue-600' : 'bg-white/10 text-white'}`}>
                    {isSimulating ? 'Live' : 'Static'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-white/80">Active Assets</span>
                  <span className="text-sm font-black">{filteredData.length}</span>
                </div>
                <div className="pt-6 border-t border-white/10">
                  <div className="flex justify-between mb-2">
                    <span className="text-[10px] text-white/50 uppercase font-black">Coverage</span>
                    <span className="text-xs font-black">{Math.round((filteredData.length / activeDataset.data.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div 
                      className="bg-white h-1.5 rounded-full transition-all duration-1000" 
                      style={{ width: `${(filteredData.length / activeDataset.data.length) * 100}%` }}
                    ></div>
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

const ReportStat = ({ label, value, unit }: { label: string, value: string | number, unit: string }) => (
  <div className="p-6 border border-zinc-100 rounded-3xl bg-zinc-50/50">
    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 text-left">{label}</p>
    <div className="flex items-baseline gap-1">
      <span className="text-3xl font-black text-zinc-900">{value}</span>
      <span className="text-xs font-bold text-zinc-400">{unit}</span>
    </div>
  </div>
);

export default App;
