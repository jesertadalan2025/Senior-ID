
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, UserPlus, QrCode, LogOut, ShieldCheck, Users, Settings as SettingsIcon, Inbox, UserCircle } from 'lucide-react';
import Dashboard from './components/Dashboard';
import SeniorForm from './components/SeniorForm';
import PublicProfile from './components/PublicProfile';
import QRScanner from './components/QRScanner';
import UserManagement from './components/UserManagement';
import Login from './components/Login';
import PublicRegister from './components/PublicRegister';
import ApplicationsList from './components/ApplicationsList';
import Settings from './components/Settings';
import { db } from './db';
import { UserAccount, SiteSettings } from './types';

const BottomNav = ({ user, onLogout }: { user: UserAccount | null, onLogout: () => void }) => {
  const location = useLocation();
  if (location.pathname.startsWith('/verify') || location.pathname === '/register' || !user) return null;

  const navItems = [];
  
  if (user.role === 'Admin' || user.role === 'Staff') {
    navItems.push({ name: 'Home', path: '/', icon: <LayoutDashboard size={20} /> });
    navItems.push({ name: 'Apps', path: '/applications', icon: <Inbox size={20} /> });
    navItems.push({ name: 'Add', path: '/add', icon: <UserPlus size={20} /> });
  }
  
  navItems.push({ name: 'Scan', path: '/scan', icon: <QrCode size={20} /> });

  if (user.role === 'Admin') {
    navItems.push({ name: 'Users', path: '/users', icon: <Users size={20} /> });
    navItems.push({ name: 'Setup', path: '/settings', icon: <SettingsIcon size={20} /> });
  }

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 px-4 no-print pointer-events-none">
      <nav className="max-w-2xl mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-full shadow-2xl p-2 flex items-center justify-around pointer-events-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-full transition-all duration-300 ${
                isActive 
                  ? 'text-[var(--primary-color)] scale-110' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <div className={`${isActive ? 'bg-[var(--primary-color)]/10 p-2 rounded-full mb-0.5' : 'p-2'}`}>
                {item.icon}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
        
        <button 
          onClick={onLogout}
          className="flex flex-col items-center justify-center flex-1 py-1 text-red-400 hover:text-red-600 transition-colors"
        >
          <div className="p-2">
            <LogOut size={20} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter opacity-0 h-0 overflow-hidden group-hover:opacity-100">Exit</span>
        </button>
      </nav>
    </div>
  );
};

const Header = ({ settings, user }: { settings: SiteSettings, user: UserAccount | null }) => {
  const location = useLocation();
  if (location.pathname.startsWith('/verify') || location.pathname === '/register' || !user) return null;

  return (
    <header className="px-6 pt-8 pb-4 flex items-center justify-between no-print">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-1.5 flex items-center justify-center border border-slate-100 dark:border-slate-700">
          <img src={settings.logoUrl} className="w-full h-full object-contain" alt="Logo" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{settings.title}</h1>
          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-0.5">OSCA Administration</p>
        </div>
      </div>
      <div className="flex items-center space-x-3 bg-white dark:bg-slate-800 px-3 py-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="text-right">
          <p className="text-[8px] font-black text-slate-400 uppercase leading-none">{user.role}</p>
          <p className="text-[11px] font-black text-slate-900 dark:text-white leading-tight">{user.username}</p>
        </div>
        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600">
           <UserCircle size={20} />
        </div>
      </div>
    </header>
  );
}

const App: React.FC = () => {
  const [user, setUser] = useState<UserAccount | null>(db.getCurrentUser());
  const [settings, setSettings] = useState<SiteSettings>(db.getSettings());

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
    if (settings.isDarkMode) {
      document.body.classList.add('dark');
      document.body.style.backgroundColor = '#0f172a';
    } else {
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc';
    }
    document.title = settings.title;
  }, [settings]);

  const handleLogin = (u: UserAccount) => setUser(u);
  const handleLogout = () => {
    if (confirm("Sign out of the system?")) {
      db.logout();
      setUser(null);
    }
  };

  const updateSettings = (newSettings: SiteSettings) => {
    db.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const getInitialRoute = () => {
    if (!user) return "/login";
    if (user.role === 'QR Checker Staff') return "/scan";
    return "/";
  };

  return (
    <HashRouter>
      <div className={`min-h-screen flex flex-col transition-colors duration-300 ${settings.isDarkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        <Header settings={settings} user={user} />
        
        <main className="flex-grow pb-28">
          <Routes>
            <Route path="/login" element={user ? <Navigate to={getInitialRoute()} /> : <Login settings={settings} onLogin={handleLogin} />} />
            <Route path="/register" element={<PublicRegister settings={settings} />} />
            
            <Route path="/" element={
              user ? (
                user.role === 'QR Checker Staff' ? <Navigate to="/scan" /> : <Dashboard />
              ) : <Navigate to="/login" />
            } />
            
            <Route path="/add" element={
              user ? (
                user.role === 'QR Checker Staff' ? <Navigate to="/scan" /> : <SeniorForm />
              ) : <Navigate to="/login" />
            } />
            
            <Route path="/edit/:id" element={
              user ? (
                user.role === 'QR Checker Staff' ? <Navigate to="/scan" /> : <SeniorForm />
              ) : <Navigate to="/login" />
            } />
            
            <Route path="/applications" element={
              user ? (
                user.role === 'QR Checker Staff' ? <Navigate to="/scan" /> : <ApplicationsList />
              ) : <Navigate to="/login" />
            } />

            <Route path="/scan" element={user ? <QRScanner /> : <Navigate to="/login" />} />
            <Route path="/users" element={user?.role === 'Admin' ? <UserManagement /> : <Navigate to={getInitialRoute()} />} />
            <Route path="/settings" element={user?.role === 'Admin' ? <Settings settings={settings} onUpdate={updateSettings} /> : <Navigate to={getInitialRoute()} />} />
            
            <Route path="/verify/:id" element={<PublicProfile />} />
          </Routes>
        </main>

        <BottomNav user={user} onLogout={handleLogout} />
        
        <footer className={`py-6 mb-24 md:mb-20 text-center text-[8px] font-black no-print uppercase tracking-[0.2em] transition-colors duration-300 ${
          settings.isDarkMode ? 'text-slate-600' : 'text-slate-300'
        }`}>
          <p>© 2024 LGU PALUAN OSCA. ALL RIGHTS RESERVED.</p>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
