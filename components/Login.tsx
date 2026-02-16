
import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, ArrowRight, Info } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../db';
import { UserAccount, SiteSettings } from '../types';

interface LoginProps {
  settings: SiteSettings;
  onLogin: (user: UserAccount) => void;
}

const Login: React.FC<LoginProps> = ({ settings, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Normalize login input to lowercase to match normalized storage
    const user = db.login(username.trim().toLowerCase(), password);
    if (user) {
      onLogin(user);
    } else {
      setError('Invalid credentials. Contact Administrator.');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--primary-color)] flex items-center justify-center px-4 relative overflow-hidden transition-colors">
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-48 -mt-48 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mb-48 blur-3xl"></div>

      <div className="max-w-md w-full z-10">
        <div className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl p-10 border border-white/10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-[2rem] mb-6 shadow-inner p-4">
               <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-2">{settings.title}</h1>
            <p className="text-[10px] font-black text-[var(--primary-color)] uppercase tracking-[0.2em]">Administrative Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center text-red-600 text-[11px] font-bold uppercase leading-snug animate-shake">
                <AlertCircle size={18} className="mr-3" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <input
                type="text"
                required
                placeholder="USERNAME"
                className="block w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-transparent focus:border-[var(--primary-color)] rounded-2xl outline-none text-slate-900 dark:text-white font-black text-sm tracking-widest placeholder:text-slate-300 transition-all lowercase"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
              />
              <input
                type="password"
                required
                placeholder="PASSWORD"
                className="block w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-transparent focus:border-[var(--primary-color)] rounded-2xl outline-none text-slate-900 dark:text-white font-black text-sm tracking-widest placeholder:text-slate-300 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="w-full flex items-center justify-center bg-[var(--primary-color)] text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest text-xs">
              Secure Login <ShieldCheck size={18} className="ml-3" />
            </button>
          </form>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800">
             <div className="flex items-start">
               <Info size={16} className="text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
               <p className="text-[9px] font-black text-blue-800 dark:text-blue-400 uppercase tracking-tight leading-tight">
                 Notice: This system uses local storage. Data created on this device is not shared with other devices.
               </p>
             </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-700 flex flex-col gap-4 text-center">
            <Link to="/register" className="inline-flex items-center justify-center text-[10px] font-black text-slate-400 hover:text-[var(--primary-color)] uppercase tracking-widest transition-all">
              Senior Self-Registration <ArrowRight size={14} className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
