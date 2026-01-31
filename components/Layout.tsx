
import React from 'react';
import { LayoutDashboard, Table, Upload, LogOut, Beaker } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  username: string;
  onLogout: () => void;
  activeTab: 'dashboard' | 'table' | 'upload';
  setActiveTab: (tab: 'dashboard' | 'table' | 'upload') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, username, onLogout, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Beaker className="text-white" size={24} />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">ChemEquip</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon={<Table size={20} />} 
            label="Equipment List" 
            active={activeTab === 'table'} 
            onClick={() => setActiveTab('table')} 
          />
          <NavItem 
            icon={<Upload size={20} />} 
            label="Import Data" 
            active={activeTab === 'upload'} 
            onClick={() => setActiveTab('upload')} 
          />
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
              {username[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{username}</p>
              <p className="text-xs text-slate-500 truncate">Senior Engineer</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-2 p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-slate-900 capitalize">{activeTab} View</h1>
          <div className="text-sm text-slate-500 font-medium bg-white px-4 py-2 rounded-full border border-slate-100">
            Internal Application v1.0.4
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all font-medium ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
        : 'hover:bg-slate-800 text-slate-400 hover:text-white'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default Layout;
