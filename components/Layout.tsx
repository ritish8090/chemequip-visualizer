
import React from 'react';
import { LayoutDashboard, Table, Upload, LogOut, Beaker, Bell, Radio, Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  username: string;
  onLogout: () => void;
  activeTab: 'dashboard' | 'table' | 'upload';
  setActiveTab: (tab: 'dashboard' | 'table' | 'upload') => void;
  alarmCount: number;
  isDark: boolean;
  setIsDark: (val: boolean) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, username, onLogout, activeTab, setActiveTab, alarmCount, isDark, setIsDark }) => {
  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
      {/* Sidebar */}
      <aside className={`w-72 fixed h-full z-20 flex flex-col transition-colors border-r ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
        <div className="p-10 flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/30">
            <Beaker className="text-white" size={24} />
          </div>
          <span className={`font-black text-2xl tracking-tighter uppercase ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Equip<span className="text-blue-600">Pro</span>
          </span>
        </div>

        <nav className="flex-1 p-6 space-y-3 mt-4">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            isDark={isDark}
          />
          <NavItem 
            icon={<Table size={20} />} 
            label="Monitors" 
            active={activeTab === 'table'} 
            onClick={() => setActiveTab('table')} 
            isDark={isDark}
          />
          <NavItem 
            icon={<Upload size={20} />} 
            label="Ingestion" 
            active={activeTab === 'upload'} 
            onClick={() => setActiveTab('upload')} 
            isDark={isDark}
          />
        </nav>

        <div className="p-8 mt-auto">
          <div className={`flex items-center gap-3 p-4 mb-6 rounded-3xl ${isDark ? 'bg-zinc-800/50' : 'bg-zinc-50'}`}>
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-inner">
              {username[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className={`text-xs font-black truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>{username}</p>
              <p className="text-[10px] text-blue-500 uppercase font-black tracking-widest">Operator</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all font-bold group ${isDark ? 'text-zinc-500 hover:text-rose-400 hover:bg-rose-400/5' : 'text-zinc-400 hover:text-rose-500 hover:bg-rose-50'}`}
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-12">
        <header className="mb-12 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className={`text-5xl font-black capitalize tracking-tighter ${isDark ? 'text-white' : 'text-zinc-900'}`}>{activeTab}</h1>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Neural Sync: active</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsDark(!isDark)}
              className={`p-3 rounded-2xl transition-all border ${isDark ? 'bg-zinc-900 border-zinc-800 text-yellow-400 hover:bg-zinc-800' : 'bg-white border-zinc-100 text-zinc-400 hover:bg-zinc-50'}`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className={`relative cursor-pointer group p-3 rounded-2xl border transition-all ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
              <Bell className={`${isDark ? 'text-zinc-400 group-hover:text-blue-400' : 'text-zinc-400 group-hover:text-blue-600'}`} size={20} />
              {alarmCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-4 shadow-lg shadow-rose-500/20" style={{ borderColor: isDark ? '#18181b' : '#f4f4f5' }}>
                  {alarmCount}
                </span>
              )}
            </div>
            <div className={`text-[10px] font-black flex items-center gap-3 px-6 py-3.5 rounded-2xl shadow-xl transition-colors ${isDark ? 'bg-blue-600 text-white shadow-blue-500/10' : 'bg-zinc-900 text-white shadow-zinc-200'}`}>
              <Radio size={14} className={isDark ? 'text-blue-200' : 'text-blue-500'} />
              SYSTEM CORE V2.0
            </div>
          </div>
        </header>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick, isDark }: { icon: any, label: string, active: boolean, onClick: () => void, isDark: boolean }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-black group relative ${
      active 
        ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30' 
        : isDark ? 'hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200' : 'hover:bg-zinc-50 text-zinc-400 hover:text-zinc-900'
    }`}
  >
    <div className={`transition-colors ${active ? 'text-white' : isDark ? 'text-zinc-700 group-hover:text-blue-400' : 'text-zinc-300 group-hover:text-blue-600'}`}>
      {icon}
    </div>
    <span className="text-xs uppercase tracking-[0.15em]">{label}</span>
    {active && <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"></div>}
  </button>
);

export default Layout;
