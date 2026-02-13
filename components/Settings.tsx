
import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Palette, Type, Image as ImageIcon, Moon, Sun, Monitor, Check } from 'lucide-react';
import { SiteSettings } from '../types';

interface SettingsProps {
  settings: SiteSettings;
  onUpdate: (settings: SiteSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate }) => {
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [saved, setSaved] = useState(false);

  const colors = [
    { name: 'Emerald', value: '#065f46' },
    { name: 'Indigo', value: '#3730a3' },
    { name: 'Blue', value: '#1e40af' },
    { name: 'Rose', value: '#9f1239' },
    { name: 'Slate', value: '#334155' },
    { name: 'Amber', value: '#92400e' },
  ];

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
          System Customization
        </h1>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Configure global branding and appearance</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8 border border-slate-100 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* General Branding */}
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center">
                  <Type size={14} className="mr-2" /> Site Title
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-[var(--primary-color)] outline-none font-bold"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center">
                  <ImageIcon size={14} className="mr-2" /> Agency Logo
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-50 dark:bg-slate-900 border flex items-center justify-center p-2">
                    <img src={formData.logoUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                  </div>
                  <label className="flex-grow px-4 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Change Logo</span>
                    <input type="file" className="sr-only" accept="image/*" onChange={handleLogoUpload} />
                  </label>
                </div>
              </div>
            </div>

            {/* Visual Theme */}
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center">
                  <Palette size={14} className="mr-2" /> Primary Theme Color
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {colors.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, primaryColor: color.value }))}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                        formData.primaryColor === color.value ? 'border-[var(--primary-color)] scale-105' : 'border-transparent'
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
                  <Moon size={14} className="mr-2" /> Interface Mode
                </label>
                <div className="flex bg-slate-50 dark:bg-slate-900 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isDarkMode: false }))}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                      !formData.isDarkMode ? 'bg-white shadow-sm text-[var(--primary-color)]' : 'text-slate-400'
                    }`}
                  >
                    <Sun size={14} /> <span>Light</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isDarkMode: true }))}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                      formData.isDarkMode ? 'bg-slate-800 shadow-sm text-white' : 'text-slate-400'
                    }`}
                  >
                    <Moon size={14} /> <span>Dark</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-10 pt-6 border-t border-slate-50 dark:border-slate-700">
            <button
              type="submit"
              className="w-full bg-[var(--primary-color)] text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-slate-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center"
            >
              {saved ? <Check size={18} className="mr-2" /> : <Save size={18} className="mr-2" />}
              {saved ? 'Changes Applied' : 'Save System Settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;
