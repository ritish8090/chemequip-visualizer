
import React, { useState } from 'react';
import { Lock, User } from 'lucide-react';

interface AuthProps {
  onLogin: (username: string) => void;
  isDark: boolean;
}

const Auth: React.FC<AuthProps> = ({ onLogin, isDark }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      onLogin(username);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${isDark ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
      <div className={`max-w-md w-full rounded-[3rem] shadow-2xl p-1 overflow-hidden transition-all ${isDark ? 'bg-zinc-900 border border-zinc-800 shadow-blue-500/5' : 'bg-white border border-zinc-100 shadow-zinc-200'}`}>
        <div className="p-12">
          <div className="flex justify-center mb-10">
            <div className="bg-blue-600 p-5 rounded-3xl shadow-2xl shadow-blue-500/40">
              <Lock className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black text-center tracking-tighter mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>EquipIQ</h2>
          <p className="text-center text-zinc-500 mb-12 font-bold uppercase tracking-[0.2em] text-[10px]">Secure Terminal Ingress</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.25em] mb-3 ml-1">Identity</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full pl-14 pr-6 py-4.5 rounded-2xl border outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold ${isDark ? 'bg-zinc-950 border-zinc-800 text-white focus:bg-zinc-900' : 'bg-zinc-50 border-zinc-100 text-zinc-900 focus:bg-white'}`}
                  placeholder="agent_01"
                />
                <User className="w-5 h-5 text-zinc-500 absolute left-5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.25em] mb-3 ml-1">Access Protocol</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-14 pr-6 py-4.5 rounded-2xl border outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold ${isDark ? 'bg-zinc-950 border-zinc-800 text-white focus:bg-zinc-900' : 'bg-zinc-50 border-zinc-100 text-zinc-900 focus:bg-white'}`}
                  placeholder="••••••••"
                />
                <Lock className="w-5 h-5 text-zinc-500 absolute left-5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-blue-500/30 mt-8 active:scale-[0.98] uppercase tracking-widest text-xs"
            >
              Initiate Sync
            </button>
          </form>
          
          <p className="mt-12 text-[10px] text-center text-zinc-500 font-black uppercase tracking-[0.4em]">
            Neural Encryption Active
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
