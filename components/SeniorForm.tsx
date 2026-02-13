
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User, Phone, MapPin, HeartPulse, Camera, RotateCcw, Image as ImageIcon, Info, UserRound } from 'lucide-react';
import { db } from '../db';
import { SeniorCitizen, SeniorStatus, Gender } from '../types';
import SeniorCard from './SeniorCard';
import SignaturePad from './SignaturePad';

const SeniorForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [formData, setFormData] = useState<Omit<SeniorCitizen, 'id' | 'createdAt'>>({
    seniorId: '',
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
    status: SeniorStatus.ACTIVE,
  });

  const [existingRecord, setExistingRecord] = useState<SeniorCitizen | null>(null);

  useEffect(() => {
    if (id) {
      const senior = db.getSeniorById(id);
      if (senior) {
        setExistingRecord(senior);
        setFormData({
          seniorId: senior.seniorId,
          firstName: senior.firstName,
          middleName: senior.middleName || '',
          lastName: senior.lastName,
          suffix: senior.suffix || '',
          dob: senior.dob,
          gender: senior.gender,
          address: senior.address,
          contactNumber: senior.contactNumber || '',
          emergencyContact: senior.emergencyContact || '',
          emergencyPhone: senior.emergencyPhone || '',
          photoUrl: senior.photoUrl,
          signatureUrl: senior.signatureUrl,
          status: senior.status,
        });
      }
    } else {
      setFormData(prev => ({ ...prev, seniorId: db.generateSeniorId() }));
    }
  }, [id]);

  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Camera access denied or not available.");
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
        const dataUrl = canvas.toDataURL('image/png');
        setFormData(prev => ({ ...prev, photoUrl: dataUrl }));
        stopCamera();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const senior: SeniorCitizen = {
      ...formData,
      id: id || Math.random().toString(36).substr(2, 9),
      createdAt: existingRecord ? existingRecord.createdAt : Date.now(),
    };
    db.saveSenior(senior);
    navigate('/');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const suffixes = ['', 'Jr.', 'Sr.', 'II', 'III', 'IV', 'V'];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between no-print">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-emerald-800 hover:text-emerald-900 font-black transition-all bg-white px-5 py-2.5 rounded-xl border border-emerald-200 shadow-sm uppercase text-xs tracking-widest"
        >
          <ArrowLeft size={16} className="mr-2" />
          Dashboard
        </button>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="lg:hidden text-emerald-800 font-black text-xs uppercase tracking-widest bg-emerald-100 px-5 py-2.5 rounded-xl"
        >
          {showPreview ? 'Edit Details' : 'View ID Card'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className={`lg:col-span-7 space-y-6 no-print ${showPreview ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8 border border-emerald-100 dark:border-slate-700">
            <h2 className="text-2xl font-black mb-8 text-emerald-900 dark:text-white flex items-center uppercase tracking-tight">
              <User className="mr-3 text-emerald-600" size={28} />
              {id ? 'Update Record' : 'OSCA Registration'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                   <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Control Number</label>
                   <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-emerald-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-emerald-50/30 dark:bg-slate-900 font-mono font-black text-emerald-900 dark:text-white text-lg"
                    value={formData.seniorId}
                    onChange={e => setFormData(prev => ({ ...prev, seniorId: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Juan"
                    className="w-full px-4 py-3 border border-gray-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white font-bold"
                    value={formData.firstName}
                    onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Middle Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Santos"
                    className="w-full px-4 py-3 border border-gray-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white font-bold"
                    value={formData.middleName}
                    onChange={e => setFormData(prev => ({ ...prev, middleName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dela Cruz"
                    className="w-full px-4 py-3 border border-gray-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white font-bold"
                    value={formData.lastName}
                    onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Suffix</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white font-black appearance-none"
                    value={formData.suffix}
                    onChange={e => setFormData(prev => ({ ...prev, suffix: e.target.value }))}
                  >
                    {suffixes.map(s => <option key={s} value={s}>{s || 'None'}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-5">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Date of Birth (Age: {calculateAge(formData.dob)})</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 border border-gray-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white font-bold"
                    value={formData.dob}
                    onChange={e => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Gender</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white font-black appearance-none"
                    value={formData.gender}
                    onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value as Gender }))}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="md:col-span-4">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Senior's Contact No.</label>
                  <input
                    type="tel"
                    placeholder="09xx-xxx-xxxx"
                    className="w-full px-4 py-3 border border-gray-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white font-bold"
                    value={formData.contactNumber}
                    onChange={e => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Status</label>
                    <select
                      className="w-full px-4 py-3 border border-gray-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white font-black appearance-none"
                      value={formData.status}
                      onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as SeniorStatus }))}
                    >
                      {Object.values(SeniorStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Full Residential Address</label>
                    <div className="relative">
                      <MapPin size={18} className="absolute left-4 top-3.5 text-gray-400" />
                      <textarea
                        required
                        rows={1}
                        placeholder="Barangay, Street, Paluan"
                        className="w-full pl-12 pr-4 py-3 border border-gray-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white font-bold text-sm"
                        value={formData.address}
                        onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      ></textarea>
                    </div>
                 </div>
              </div>

              <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800 space-y-4">
                <h3 className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest flex items-center">
                  <HeartPulse size={16} className="mr-2 text-emerald-600" />
                  Emergency Contact Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Contact Person Name</label>
                    <div className="relative">
                      <UserRound size={16} className="absolute left-4 top-3.5 text-gray-400" />
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        className="w-full pl-12 pr-4 py-3 border border-gray-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white font-bold"
                        value={formData.emergencyContact}
                        onChange={e => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Contact Number</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-4 top-3.5 text-gray-400" />
                      <input
                        type="tel"
                        required
                        placeholder="09xx-xxx-xxxx"
                        className="w-full pl-12 pr-4 py-3 border border-gray-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white font-bold"
                        value={formData.emergencyPhone}
                        onChange={e => setFormData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-emerald-50 dark:border-slate-700 grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-5">
                  <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">Official 1x1 Photo</label>
                  <div className="space-y-4">
                    <div className="relative h-56 w-full rounded-2xl bg-emerald-50 dark:bg-slate-900 border-2 border-dashed border-emerald-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-inner group">
                      {isCameraOpen ? (
                        <>
                          <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover scale-x-[-1]" />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-40 h-40 border-2 border-white/50 border-dashed rounded-lg" />
                          </div>
                          <button 
                            type="button"
                            onClick={capturePhoto}
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white p-4 rounded-full shadow-xl active:scale-95 transition-all"
                          >
                            <Camera size={24} />
                          </button>
                        </>
                      ) : formData.photoUrl ? (
                        <div className="relative h-full w-full group">
                          <img src={formData.photoUrl} alt="Preview" className="h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <button type="button" onClick={() => setFormData(p => ({ ...p, photoUrl: '' }))} className="text-white bg-red-500 p-2 rounded-full">
                               <RotateCcw size={16} />
                             </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <User size={48} className="text-emerald-200 mb-2" />
                          <span className="text-[10px] font-black text-emerald-300 uppercase">Awaiting Image</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                       <div className="grid grid-cols-2 gap-2">
                          <label className="px-3 py-3 bg-white dark:bg-slate-900 border-2 border-emerald-600 text-emerald-600 rounded-xl text-[9px] font-black cursor-pointer hover:bg-emerald-50 transition-all flex items-center justify-center uppercase tracking-widest text-center">
                            <ImageIcon size={14} className="mr-2" />
                            File
                            <input type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                          </label>
                          <button 
                            type="button"
                            onClick={isCameraOpen ? stopCamera : startCamera}
                            className={`px-3 py-3 rounded-xl text-[9px] font-black transition-all flex items-center justify-center uppercase tracking-widest border-2 ${
                              isCameraOpen ? 'bg-red-50 text-red-600 border-red-600' : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                            }`}
                          >
                            <Camera size={14} className="mr-2" />
                            {isCameraOpen ? 'Cancel' : 'Camera'}
                          </button>
                       </div>
                    </div>
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                
                <div className="md:col-span-7">
                  <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">Electronic Signature Pad</label>
                  <SignaturePad 
                    initialImage={formData.signatureUrl}
                    onSave={(dataUrl) => setFormData(prev => ({ ...prev, signatureUrl: dataUrl }))} 
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center bg-emerald-700 hover:bg-emerald-800 text-white font-black py-5 px-6 rounded-2xl shadow-2xl shadow-emerald-200 transition-all active:scale-95 uppercase tracking-[0.2em] text-sm"
              >
                <Save size={20} className="mr-2" />
                {id ? 'Confirm Update' : 'Submit Registration'}
              </button>
            </form>
          </div>
        </div>

        <div className={`lg:col-span-5 space-y-6 flex flex-col items-center ${showPreview ? 'block' : 'hidden lg:block'}`}>
          <div className="sticky top-24 w-full flex flex-col items-center">
            <div className="transform scale-90 lg:scale-100 origin-top transition-transform">
              <SeniorCard 
                senior={{
                  ...formData,
                  id: id || 'preview-only',
                  createdAt: existingRecord ? existingRecord.createdAt : Date.now()
                }}
              />
            </div>
            <div className="mt-8 p-6 bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 rounded-2xl shadow-sm no-print w-full">
               <div className="flex items-center space-x-3 mb-4">
                 <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600">
                    <Info size={20} />
                 </div>
                 <h4 className="font-black text-emerald-900 dark:text-white uppercase text-xs tracking-widest">Entry Guidelines</h4>
               </div>
               <p className="text-[11px] text-gray-500 dark:text-slate-400 font-bold leading-relaxed uppercase">
                 Ensure all fields are accurate. Proper casing is preserved. The Senior's Contact Number will appear on the physical ID card for quick verification.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeniorForm;
