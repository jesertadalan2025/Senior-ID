
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, MapPin, HeartPulse, Camera, RotateCcw, Image as ImageIcon, Check, UserRound, ArrowRight, ShieldCheck } from 'lucide-react';
import { db } from '../db';
import { ApplicationStatus, Gender, RegistrationApplication, SiteSettings } from '../types';
import SignaturePad from './SignaturePad';

const PublicRegister: React.FC<{ settings: SiteSettings }> = ({ settings }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [appId, setAppId] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Explicitly define the form state type to omit all auto-generated or staff-only fields
  const [formData, setFormData] = useState<Omit<RegistrationApplication, 'id' | 'applicationId' | 'appStatus' | 'createdAt' | 'reviewedBy' | 'reviewedAt'>>({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    dob: '',
    gender: 'Male',
    address: '',
    contactNumber: '',
    emergencyContact: '',
    emergencyPhone: '',
    photoUrl: '',
    signatureUrl: '',
  });

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        setFormData(prev => ({ ...prev, photoUrl: canvas.toDataURL('image/png') }));
        stopCamera();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.photoUrl || !formData.signatureUrl) {
      alert("Please provide both a photo and a signature.");
      return;
    }

    const newAppId = db.generateAppId();
    const application: RegistrationApplication = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      applicationId: newAppId,
      appStatus: ApplicationStatus.PENDING,
      createdAt: Date.now()
    };

    db.saveApplication(application);
    setAppId(newAppId);
    setStep('success');
    window.scrollTo(0, 0);
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 mx-auto rounded-full flex items-center justify-center shadow-lg">
            <ShieldCheck size={48} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Registration Filed</h1>
            <p className="text-slate-500 font-medium">Your application has been submitted to {settings.title}.</p>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Application Tracking ID</p>
            <div className="text-4xl font-black text-[var(--primary-color)] font-mono tracking-tighter">{appId}</div>
            <p className="mt-4 text-[11px] text-slate-500 font-bold uppercase leading-relaxed">
              Please save this ID. Our staff will review your profile within 1-3 working days.
            </p>
          </div>

          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-[var(--primary-color)] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 py-8 text-center px-4">
        <img src={settings.logoUrl} className="w-16 h-16 mx-auto mb-4 object-contain bg-white rounded-full p-1" alt="Logo" />
        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{settings.title}</h1>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Online Senior Citizen Registration Portal</p>
      </header>

      <div className="max-w-3xl mx-auto px-4 -mt-6">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 shadow-2xl rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-700 space-y-8">
          <div className="flex items-center space-x-3 mb-4">
             <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center">
                <User size={20} />
             </div>
             <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase">Personal Particulars</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">First Name</label>
              <input type="text" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] outline-none font-bold text-slate-900 dark:text-white" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Middle Name</label>
              <input type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] outline-none font-bold text-slate-900 dark:text-white" value={formData.middleName} onChange={e => setFormData({...formData, middleName: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Last Name</label>
              <input type="text" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] outline-none font-bold text-slate-900 dark:text-white" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Suffix</label>
              <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white" value={formData.suffix} onChange={e => setFormData({...formData, suffix: e.target.value})}>
                {['', 'Jr.', 'Sr.', 'II', 'III', 'IV'].map(s => <option key={s} value={s}>{s || 'None'}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Date of Birth</label>
              <input type="date" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gender</label>
              <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as Gender})}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Contact Number</label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-3.5 text-slate-400" />
                <input type="tel" required placeholder="09xx-xxx-xxxx" className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white" value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Residential Address</label>
              <div className="relative">
                <MapPin size={18} className="absolute left-4 top-3.5 text-slate-400" />
                <input required placeholder="Barangay, Street" className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-[var(--primary-color)] uppercase tracking-widest mb-2">1x1 Profile Photo</label>
              <div className="relative h-64 bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl flex items-center justify-center overflow-hidden">
                {isCameraOpen ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover scale-x-[-1]" />
                    <button type="button" onClick={capturePhoto} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[var(--primary-color)] text-white p-4 rounded-full shadow-2xl">
                      <Camera size={24} />
                    </button>
                  </>
                ) : formData.photoUrl ? (
                  <img src={formData.photoUrl} className="h-full w-full object-cover" alt="Profile" />
                ) : (
                  <div className="text-center p-6">
                    <ImageIcon size={48} className="mx-auto text-slate-200 mb-2" />
                    <p className="text-[10px] font-black text-slate-300 uppercase">Image Required</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <label className="flex-1 bg-white dark:bg-slate-900 border-2 border-[var(--primary-color)] text-[var(--primary-color)] py-3 rounded-xl text-[10px] font-black uppercase text-center cursor-pointer">
                  Upload File
                  <input type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                </label>
                <button type="button" onClick={isCameraOpen ? stopCamera : startCamera} className="flex-1 bg-[var(--primary-color)] text-white py-3 rounded-xl text-[10px] font-black uppercase">
                  {isCameraOpen ? 'Cancel' : 'Take Photo'}
                </button>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-[var(--primary-color)] uppercase tracking-widest mb-2">Signature</label>
              <SignaturePad onSave={(url) => setFormData({...formData, signatureUrl: url})} />
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-2xl border border-red-100 dark:border-red-900/30">
            <div className="flex items-center space-x-2 mb-4">
              <HeartPulse size={18} className="text-red-600" />
              <h3 className="text-xs font-black text-red-900 dark:text-red-400 uppercase">Emergency Contact</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Contact Name" required className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl font-bold" value={formData.emergencyContact} onChange={e => setFormData({...formData, emergencyContact: e.target.value})} />
              <input type="tel" placeholder="Mobile Number" required className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl font-bold" value={formData.emergencyPhone} onChange={e => setFormData({...formData, emergencyPhone: e.target.value})} />
            </div>
          </div>

          <button type="submit" className="w-full bg-[var(--primary-color)] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl transition-all active:scale-95 flex items-center justify-center">
            Submit Application <ArrowRight size={20} className="ml-3" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default PublicRegister;
