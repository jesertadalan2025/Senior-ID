
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, UserPlus, QrCode, LogOut, ShieldCheck, Menu, X, Users, Settings as SettingsIcon, Inbox } from 'lucide-react';
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

const Navbar = ({ user, settings, onLogout }: { user: UserAccount | null, settings: SiteSettings, onLogout: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  if (location.pathname.startsWith('/verify') || location.pathname === '/register' || location.pathname === '/register-success' || !user) return null;

  const navItems = [];
  
  if (user.role === 'Admin' || user.role === 'Staff') {
    navItems.push({ name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> });
    navItems.push({ name: 'Applications', path: '/applications', icon: <Inbox size={20} /> });
    navItems.push({ name: 'Register Senior', path: '/add', icon: <UserPlus size={20} /> });
  }
  
  navItems.push({ name: 'QR Scanner', path: '/scan', icon: <QrCode size={20} /> });

  if (user.role === 'Admin') {
    navItems.push({ name: 'Users', path: '/users', icon: <Users size={20} /> });
    navItems.push({ name: 'Settings', path: '/settings', icon: <SettingsIcon size={20} /> });
  }

  return (
    <nav className="bg-[var(--primary-color)] text-white shadow-lg sticky top-0 z-50 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
             <img src={settings.logoUrl} className="w-8 h-8 bg-white rounded-full p-0.5 object-contain" alt="Logo" />
             <span className="font-black text-lg tracking-tight uppercase truncate max-w-[200px]">{settings.title}</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            <div className="flex items-baseline space-x-2 mr-4 border-r border-white/10 pr-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                    location.pathname === item.path ? 'bg-black/20 text-white shadow-inner' : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-[10px] font-bold text-white/60 uppercase leading-none">{user.role}</p>
                <p className="text-sm font-black leading-none">{user.username}</p>
              </div>
              <button 
                onClick={onLogout}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white/80 hover:bg-white/10 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-black/20 backdrop-blur-lg border-t border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium ${
                  location.pathname === item.path ? 'bg-white/10 text-white' : 'text-white/80'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
            <button 
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-white/80 hover:bg-white/10"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserAccount | null>(db.getCurrentUser());
  const [settings, setSettings] = useState<SiteSettings>(db.getSettings());

  useEffect(() => {
    // Apply theme
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
    if (settings.isDarkMode) {
      document.body.classList.add('dark');
      document.body.style.backgroundColor = '#0f172a'; // slate-900
    } else {
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc';
    }
    document.title = settings.title;
  }, [settings]);

  const handleLogin = (u: UserAccount) => setUser(u);
  const handleLogout = () => {
    db.logout();
    setUser(null);
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
        <Navbar user={user} settings={settings} onLogout={handleLogout} />
        <main className="flex-grow">
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
        
        <footer className={`py-6 text-center text-[10px] font-bold no-print uppercase tracking-widest border-t transition-colors duration-300 ${
          settings.isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400'
        }`}>
          <p>© 2024 LGU PALUAN - {settings.title.toUpperCase()} (OSCA). ALL RIGHTS RESERVED.</p>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
