
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Edit2, Trash2, ExternalLink, Search, CheckCircle, XCircle, Shield, Inbox, UserPlus } from 'lucide-react';
import { db } from '../db';
import { SeniorCitizen, SeniorStatus, UserAccount, RegistrationApplication, ApplicationStatus } from '../types';

const Dashboard: React.FC = () => {
  const [seniors, setSeniors] = useState<SeniorCitizen[]>([]);
  const [apps, setApps] = useState<RegistrationApplication[]>([]);
  const [search, setSearch] = useState('');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setSeniors(db.getSeniors());
    setApps(db.getApplications());
    setCurrentUser(db.getCurrentUser());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      db.deleteSenior(id);
      setSeniors(db.getSeniors());
    }
  };

  const isAdmin = currentUser?.role === 'Admin';
  const pendingApps = apps.filter(a => a.appStatus === ApplicationStatus.PENDING).length;

  const filteredSeniors = seniors.filter(s => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    s.seniorId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
           <div className="flex justify-between items-start">
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Registered</p>
                 <h3 className="text-3xl font-black text-slate-900 dark:text-white">{seniors.length}</h3>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl">
                 <Shield size={24} />
              </div>
           </div>
        </div>
        
        <Link to="/applications" className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-[var(--primary-color)] transition-all group">
           <div className="flex justify-between items-start">
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Applications</p>
                 <h3 className="text-3xl font-black text-slate-900 dark:text-white">{pendingApps}</h3>
              </div>
              <div className={`p-3 rounded-2xl transition-all ${pendingApps > 0 ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600' : 'bg-slate-50 dark:bg-slate-900 text-slate-400'}`}>
                 <Inbox size={24} className={pendingApps > 0 ? 'animate-bounce' : ''} />
              </div>
           </div>
           <p className="mt-4 text-[9px] font-black text-[var(--primary-color)] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
             Review Queue <ExternalLink size={10} className="ml-1" />
           </p>
        </Link>

        <div className="hidden lg:block bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
           <div className="flex justify-between items-start">
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">System Health</p>
                 <h3 className="text-sm font-black text-emerald-600 uppercase tracking-tighter">Operational</h3>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl">
                 <CheckCircle size={24} />
              </div>
           </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center">
            OSCA Registry
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Official Master list of Senior Citizens</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search Name or ID..."
              className="pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-[var(--primary-color)] w-full sm:w-64 outline-none transition-all font-bold text-slate-900 dark:text-white text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link
            to="/add"
            className="bg-[var(--primary-color)] text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-900/20 transition-all active:scale-95 flex items-center justify-center"
          >
            <UserPlus size={16} className="mr-2" />
            New Entry
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-xl rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-700">
        <div className="overflow-x-auto no-scrollbar">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">OSCA ID</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {filteredSeniors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No matching records found</p>
                  </td>
                </tr>
              ) : (
                filteredSeniors.map((senior) => (
                  <tr key={senior.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img className="h-10 w-10 rounded-xl object-cover border border-slate-100 dark:border-slate-700 shadow-sm" src={senior.photoUrl} alt="Photo" />
                        <div className="ml-4">
                          <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{senior.lastName}, {senior.firstName}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate max-w-[150px]">{senior.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-mono font-black border border-slate-100 dark:border-slate-700 shadow-inner">
                        {senior.seniorId}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        senior.status === SeniorStatus.ACTIVE 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        {senior.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                      {new Date(senior.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button onClick={() => window.open(`#/verify/${senior.id}`, '_blank')} className="p-2.5 text-slate-400 hover:text-[var(--primary-color)] hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all" title="View Verification"><ExternalLink size={20} /></button>
                        <button onClick={() => navigate(`/edit/${senior.id}`)} className="p-2.5 text-slate-400 hover:text-[var(--primary-color)] hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all" title="Edit Record"><Edit2 size={20} /></button>
                        {isAdmin && <button onClick={() => handleDelete(senior.id)} className="p-2.5 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete Permanent"><Trash2 size={20} /></button>}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
