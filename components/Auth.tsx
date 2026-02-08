
import React, { useState, useEffect } from 'react';
import { Lock, User, UserPlus, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthProps {
  onLogin: (username: string) => void;
  isDark: boolean;
}

const Auth: React.FC<AuthProps> = ({ onLogin, isDark }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Clear states when switching modes
  useEffect(() => {
    setError(null);
    setSuccess(null);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  }, [isSignUp]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!username || !password) {
      setError("Identification protocols incomplete.");
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('equipiq_users') || '{}');

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError("Neural keys do not match.");
        return;
      }
      if (storedUsers[username]) {
        setError("Identity already exists in registry.");
        return;
      }
      
      // Register user
      storedUsers[username] = password;
      localStorage.setItem('equipiq_users', JSON.stringify(storedUsers));
      setSuccess("Account archived. Transitioning to login...");
      setTimeout(() => setIsSignUp(false), 2000);
    } else {
      // Login logic
      if (storedUsers[username] === password) {
        onLogin(username);
      } else {
        setError("Access denied. Invalid credentials.");
      }
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-500 ${isDark ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
      <div className={`max-w-md w-full rounded-[3rem] shadow-2xl p-1 overflow-hidden transition-all ${isDark ? 'bg-zinc-900 border border-zinc-800 shadow-blue-500/10' : 'bg-white border border-zinc-100 shadow-zinc-200'}`}>
        <div className="p-10 sm:p-12">
          <div className="flex justify-center mb-10">
            <div className="bg-blue-600 p-5 rounded-3xl shadow-2xl shadow-blue-500/40 transform transition-transform hover:scale-110">
              {isSignUp ? <UserPlus className="w-10 h-10 text-white" /> : <Lock className="w-10 h-10 text-white" />}
            </div>
          </div>
          
          <h2 className={`text-4xl font-black text-center tracking-tighter mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            EquipIQ
          </h2>
          <p className="text-center text-zinc-500 mb-10 font-bold uppercase tracking-[0.2em] text-[10px]">
            {isSignUp ? 'New Account Initialization' : 'Secure Terminal Ingress'}
          </p>

          {error && (
            <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{success}</p>
            </div>
          )}
          
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

            {isSignUp && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.25em] mb-3 ml-1">Confirm Protocol</label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-14 pr-6 py-4.5 rounded-2xl border outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold ${isDark ? 'bg-zinc-950 border-zinc-800 text-white focus:bg-zinc-900' : 'bg-zinc-50 border-zinc-100 text-zinc-900 focus:bg-white'}`}
                    placeholder="••••••••"
                  />
                  <Lock className="w-5 h-5 text-zinc-500 absolute left-5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-blue-500/30 mt-8 active:scale-[0.98] uppercase tracking-widest text-xs flex items-center justify-center gap-3"
            >
              {isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />}
              {isSignUp ? 'Initialize Profile' : 'Initiate Sync'}
            </button>
          </form>
          
          <div className="mt-10 pt-8 border-t border-zinc-800/10 flex flex-col items-center gap-4">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-colors"
            >
              {isSignUp ? 'Return to Login Terminal' : 'Request New Neural Profile'}
            </button>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em]">
              Neural Encryption Active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
