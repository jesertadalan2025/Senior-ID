
import React, { useState, useRef } from 'react';
import { Settings as SettingsIcon, Save, Palette, Type, Image as ImageIcon, Moon, Sun, Download, Upload, Check, AlertCircle } from 'lucide-react';
import { SiteSettings } from '../types';
import { db } from '../db';

interface SettingsProps {
  settings: SiteSettings;
  onUpdate: (settings: SiteSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate }) => {
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colors = [
    { name: 'Emerald', value: '#065f46' },
    { name: 'Indigo', value: '#3730a3' },
    { name: 'Blue', value: '#1e40af' },
    { name: 'Rose', value: '#9f1239' },
    { name: 'Slate', value: '#334155' },
    { name: 'Amber', value: '#92400e' },
  ];

  const handleExport = () => {
    const data = db.exportFullDatabase();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seniorid-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (db.importFullDatabase(content)) {
          alert("Database imported successfully! The page will now reload.");
          window.location.reload();
        } else {
          alert("Invalid database file.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[var(--primary-color)] uppercase tracking-tight flex items-center">
          <SettingsIcon className="mr-3" />
          System Settings
        </h1>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Branding & Data Portability</p>
      </div>

      <div className="space-y-8">
        {/* Branding Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 shadow-xl rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Visual Customization</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center">
                  <Type size={14} className="mr-2" /> Site Title
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-4 border border-slate-100 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-[var(--primary-color)] outline-none font-bold"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center">
                  <ImageIcon size={14} className="mr-2" /> Agency Logo
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-900 border flex items-center justify-center p-2">
                    <img src={formData.logoUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                  </div>
                  <label className="flex-grow px-4 py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Change Logo</span>
                    <input type="file" className="sr-only" accept="image/*" onChange={handleLogoUpload} />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center">
                  <Palette size={14} className="mr-2" /> Primary Color
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {colors.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, primaryColor: color.value }))}
                      className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                        formData.primaryColor === color.value ? 'border-[var(--primary-color)] scale-105 shadow-md' : 'border-transparent'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: color.value }} />
                      <span className="text-[8px] font-black uppercase tracking-tighter text-slate-500">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center">
                  <Moon size={14} className="mr-2" /> Dark Mode
                </label>
                <div className="flex bg-slate-50 dark:bg-slate-900 p-1.5 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isDarkMode: false }))}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${
                      !formData.isDarkMode ? 'bg-white shadow-sm text-[var(--primary-color)]' : 'text-slate-400'
                    }`}
                  >
                    <Sun size={14} /> <span>Light</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isDarkMode: true }))}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${
                      formData.isDarkMode ? 'bg-slate-800 shadow-sm text-white' : 'text-slate-400'
                    }`}
                  >
                    <Moon size={14} /> <span>Dark</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full mt-10 bg-[var(--primary-color)] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 flex items-center justify-center"
          >
            {saved ? <Check size={18} className="mr-2" /> : <Save size={18} className="mr-2" />}
            {saved ? 'Changes Applied' : 'Update UI Settings'}
          </button>
        </form>

        {/* Database Management Tools */}
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700">
           <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600 mr-4">
                 <AlertCircle size={20} />
              </div>
              <div>
                 <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Database Portability</h2>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Move accounts & records between devices</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={handleExport}
                className="flex items-center justify-center bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-700 text-slate-900 dark:text-white p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 transition-all group"
              >
                <div className="text-center">
                   <div className="bg-white dark:bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border group-hover:scale-110 transition-transform">
                      <Download size={20} className="text-blue-500" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest">Backup Database</p>
                   <p className="text-[8px] font-bold text-slate-400 mt-1">Download entire data file</p>
                </div>
              </button>

              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-700 text-slate-900 dark:text-white p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 transition-all group"
              >
                <div className="text-center">
                   <div className="bg-white dark:bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border group-hover:scale-110 transition-transform">
                      <Upload size={20} className="text-emerald-500" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest">Restore Database</p>
                   <p className="text-[8px] font-bold text-slate-400 mt-1">Upload a backup file</p>
                   <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="sr-only" 
                    accept="application/json" 
                    onChange={handleImport} 
                   />
                </div>
              </button>
           </div>
           
           <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30 text-center">
              <p className="text-[9px] font-black text-blue-700 dark:text-blue-400 uppercase leading-relaxed">
                Use these tools to sync accounts across devices. Create accounts on one laptop, backup the file, and restore it on other staff computers or phones.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
