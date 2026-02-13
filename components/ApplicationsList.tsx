
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { RegistrationApplication, ApplicationStatus } from '../types';
import { Inbox, CheckCircle, XCircle, Clock, Eye, Trash2, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ApplicationsList: React.FC = () => {
  const [apps, setApps] = useState<RegistrationApplication[]>([]);
  const [filter, setFilter] = useState<ApplicationStatus>(ApplicationStatus.PENDING);
  const [selectedApp, setSelectedApp] = useState<RegistrationApplication | null>(null);
  const navigate = useNavigate();
  const currentUser = db.getCurrentUser();

  const refreshList = () => {
    setApps(db.getApplications());
  };

  useEffect(() => {
    refreshList();
  }, []);

  const handleApprove = (id: string) => {
    if (!currentUser) return;
    if (confirm('Approve this application and generate an Official Senior ID?')) {
      db.approveApplication(id, currentUser.id);
      refreshList();
      setSelectedApp(null);
    }
  };

  const handleReject = (id: string) => {
    if (confirm('Are you sure you want to reject this application?')) {
      const allApps = db.getApplications();
      const appIndex = allApps.findIndex(a => a.id === id);
      if (appIndex > -1) {
        const updatedApp = { ...allApps[appIndex], appStatus: ApplicationStatus.REJECTED };
        db.updateApplication(updatedApp);
        refreshList();
        setSelectedApp(null);
      }
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Permanently delete this application record?')) {
      db.deleteApplication(id);
      refreshList();
    }
  };

  const filteredApps = apps.filter(a => a.appStatus === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center">
            <Inbox className="mr-3 text-[var(--primary-color)]" />
            Registration Queue
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Review public registrations for approval</p>
        </div>
        
        <div className="flex bg-white dark:bg-slate-800 p-1 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
          {Object.values(ApplicationStatus).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === status ? 'bg-[var(--primary-color)] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {status} ({apps.filter(a => a.appStatus === status).length})
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-xl rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Applicant</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">App ID</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Filed</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <Inbox className="text-slate-200 dark:text-slate-700 mb-2" size={48} />
                      <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No applications in this category</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApps.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img src={app.photoUrl} className="w-12 h-12 rounded-xl object-cover mr-4 border border-slate-100 dark:border-slate-700 shadow-sm" alt="Profile" />
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white uppercase">{app.lastName}, {app.firstName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter line-clamp-1">{app.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                        {app.applicationId}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => setSelectedApp(app)}
                          className="p-3 text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white rounded-xl transition-all"
                          title="View Application"
                        >
                          <Eye size={20} />
                        </button>
                        {filter !== ApplicationStatus.PENDING && (
                           <button 
                            onClick={() => handleDelete(app.id)}
                            className="p-3 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Record"
                           >
                             <Trash2 size={20} />
                           </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[2rem] md:rounded-[2.5rem] shadow-2xl p-6 md:p-10 overflow-y-auto max-h-[95vh] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Application Review</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Ref ID: {selectedApp.applicationId}</p>
              </div>
              <button 
                onClick={() => setSelectedApp(null)} 
                className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-6">
                <div className="relative group">
                  <img src={selectedApp.photoUrl} className="w-full aspect-square object-cover rounded-3xl border border-slate-100 dark:border-slate-700 shadow-md" alt="Applicant Photo" />
                  <div className="absolute top-4 left-4">
                     <span className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-white shadow-sm">1x1 Photo</span>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-inner">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center">
                     <CheckCircle size={14} className="mr-2 text-emerald-500" /> Digital Signature
                   </p>
                   <div className="h-20 w-full flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl p-2 border border-slate-100 dark:border-slate-700">
                     <img src={selectedApp.signatureUrl} className="max-h-full max-w-full object-contain mix-blend-multiply dark:invert" alt="Signature" />
                   </div>
                </div>
              </div>
              
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Full Applicant Name</label>
                    <p className="text-xl font-black text-slate-900 dark:text-white uppercase leading-tight">
                      {selectedApp.lastName}, {selectedApp.firstName} {selectedApp.middleName} {selectedApp.suffix}
                    </p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Gender</label>
                      <p className="font-bold text-slate-900 dark:text-white uppercase text-sm">{selectedApp.gender}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Birth Date</label>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{new Date(selectedApp.dob).toLocaleDateString()}</p>
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Contact Number</label>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{selectedApp.contactNumber || 'No record'}</p>
                 </div>

                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Home Address</label>
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">{selectedApp.address}</p>
                 </div>

                 <div className="p-5 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30">
                    <p className="text-[9px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-2 flex items-center">
                      <Clock size={12} className="mr-1.5" /> Emergency Contact
                    </p>
                    <p className="text-sm font-black text-slate-900 dark:text-slate-200">{selectedApp.emergencyContact}</p>
                    <p className="text-sm font-black text-red-600 dark:text-red-400 mt-1">{selectedApp.emergencyPhone}</p>
                 </div>
              </div>
            </div>

            {selectedApp.appStatus === ApplicationStatus.PENDING && (
              <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => handleReject(selectedApp.id)}
                  className="w-full py-4 border-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all active:scale-95"
                >
                  Reject Registration
                </button>
                <button 
                  onClick={() => handleApprove(selectedApp.id)}
                  className="w-full py-4 bg-[var(--primary-color)] text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl shadow-xl shadow-emerald-900/20 transition-all active:scale-95 flex items-center justify-center"
                >
                  <CheckCircle size={18} className="mr-2" />
                  Approve & Issue ID
                </button>
              </div>
            )}
            
            {selectedApp.appStatus !== ApplicationStatus.PENDING && (
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Processed on {selectedApp.reviewedAt ? new Date(selectedApp.reviewedAt).toLocaleString() : 'N/A'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsList;
