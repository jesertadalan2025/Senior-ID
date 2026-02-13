
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { SeniorCitizen, SeniorStatus } from '../types';
import { Printer } from 'lucide-react';

interface SeniorCardProps {
  senior: SeniorCitizen;
}

const SeniorCard: React.FC<SeniorCardProps> = ({ senior }) => {
  const verificationUrl = `${window.location.origin}${window.location.pathname}#/verify/${senior.id}`;

  const handlePrint = () => {
    window.print();
  };

  const calculateAge = (dob: string) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formattedDate = new Date(senior.createdAt).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const sealUrl = "https://upload.wikimedia.org/wikipedia/commons/e/e0/Paluan_Seal.png";

  return (
    <div className="flex flex-col items-center">
      <div className="w-[400px] h-[260px] bg-white rounded-lg shadow-2xl border border-emerald-600 overflow-hidden relative flex flex-col font-sans mb-4 print:shadow-none print:border print:border-emerald-700">
        
        {/* Middle Logo Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 z-0">
          <img src={sealUrl} alt="Watermark" className="w-48 h-48 object-contain" />
        </div>

        {/* Top Header Section */}
        <div className="bg-emerald-800 h-24 w-full flex items-center px-4 z-10 border-b border-emerald-900 shadow-sm">
          <img 
            src={sealUrl}
            alt="Paluan Seal" 
            className="w-16 h-16 object-contain mr-3 bg-white rounded-full p-1"
            onError={(e) => {
               (e.target as any).src = 'https://via.placeholder.com/100?text=LOGO';
            }}
          />
          <div className="flex flex-col flex-1 text-white">
            <span className="text-[8px] font-medium uppercase leading-none opacity-90">Republic of the Philippines</span>
            <span className="text-[8px] font-medium uppercase leading-none opacity-90">Province of Occidental Mindoro</span>
            <span className="text-[12px] font-black uppercase leading-tight mt-0.5">MUNICIPALITY OF PALUAN</span>
            <span className="text-[8px] font-bold text-emerald-200 uppercase leading-none mt-1">Office of Senior Citizen Affairs</span>
          </div>
          <div className="flex flex-col items-end">
            <div className="bg-yellow-400 text-emerald-900 text-[8px] font-black px-2 py-0.5 rounded-sm uppercase mb-1 shadow-sm">Official ID</div>
            <span className="text-[10px] font-mono font-black text-white bg-emerald-900/50 px-2 py-0.5 rounded">{senior.seniorId || 'CT-000000'}</span>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex p-3 flex-1 z-10 relative">
          {/* Left Column: 1x1 Photo */}
          <div className="flex flex-col items-center w-28 flex-shrink-0 mr-3">
            <div className="w-24 h-24 border-2 border-emerald-800 bg-white flex-shrink-0 mb-1 flex items-center justify-center overflow-hidden shadow-sm">
              {senior.photoUrl ? (
                <img src={senior.photoUrl} alt="Photo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[7px] text-emerald-300 text-center uppercase font-black bg-emerald-50">1x1 PHOTO</div>
              )}
            </div>
            
            <div className="text-center mt-1">
              <p className="text-[6px] text-emerald-600 font-black uppercase leading-none">Date Issued</p>
              <p className="text-[8px] font-black text-gray-800">{formattedDate}</p>
            </div>

            <div className="mt-auto p-1 bg-white border border-emerald-100 rounded shadow-sm">
              <QRCodeSVG value={verificationUrl} size={40} />
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            <div className="space-y-1">
              <div className="flex flex-col">
                <span className="text-[7px] font-bold text-emerald-600 uppercase leading-none">Full Name:</span>
                <h2 className="text-[11px] font-black text-gray-900 leading-tight truncate">
                  {senior.lastName}, {senior.firstName} {senior.middleName} {senior.suffix}
                </h2>
              </div>

              <div className="flex flex-col">
                <span className="text-[7px] font-bold text-emerald-600 uppercase leading-none">Address:</span>
                <p className="text-[8px] font-bold text-gray-700 leading-tight line-clamp-2 min-h-[16px]">{senior.address || 'N/A'}</p>
              </div>

              <div className="flex items-center space-x-4">
                 <div className="flex flex-col">
                    <span className="text-[7px] font-bold text-emerald-600 uppercase leading-none">Contact No:</span>
                    <p className="text-[9px] font-black text-gray-800">{senior.contactNumber || 'N/A'}</p>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[7px] font-bold text-emerald-600 uppercase leading-none">Gender:</span>
                    <p className="text-[9px] font-black text-gray-800 uppercase">{senior.gender || '---'}</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-1">
                <div className="flex flex-col">
                   <span className="text-[7px] font-bold text-emerald-600 uppercase leading-none">DOB:</span>
                   <p className="text-[9px] font-black text-gray-800 uppercase">{senior.dob ? new Date(senior.dob).toLocaleDateString() : '---'}</p>
                </div>
                <div className="flex flex-col">
                   <span className="text-[7px] font-bold text-emerald-600 uppercase leading-none text-red-600">Age:</span>
                   <p className="text-[9px] font-black text-red-600 uppercase">{calculateAge(senior.dob)}</p>
                </div>
              </div>
            </div>

            {/* Signature Area */}
            <div className="flex items-end justify-between border-t border-emerald-100 pt-1.5 mt-auto">
               <div className="flex flex-col items-center">
                 <div className="h-9 w-28 relative flex items-center justify-center bg-emerald-50/20 rounded">
                   {senior.signatureUrl ? (
                     <img src={senior.signatureUrl} alt="Sign" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                   ) : (
                     <div className="w-full border-b border-emerald-300 h-4"></div>
                   )}
                 </div>
                 <span className="text-[6px] font-black text-emerald-600 uppercase mt-0.5">Signature</span>
               </div>
               
               <div className="flex flex-col items-end">
                  <div className={`px-2 py-0.5 rounded text-[7px] font-black uppercase border mb-1 ${
                    senior.status === SeniorStatus.ACTIVE ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {senior.status}
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bg-emerald-900 h-2 w-full flex justify-between px-3 items-center">
           <span className="text-[5px] text-white/50 font-mono">SECURE PALUAN OSCA ID SYSTEM</span>
           <span className="text-[5px] text-white/50 font-mono">VER 2.1</span>
        </div>
      </div>
      
      <button 
        onClick={handlePrint}
        className="no-print flex items-center bg-emerald-800 hover:bg-emerald-900 text-white px-8 py-3 rounded-xl text-sm font-black transition-all shadow-xl hover:scale-105 active:scale-95 uppercase tracking-widest border-2 border-emerald-600"
      >
        <Printer size={18} className="mr-2" />
        Print Official Green ID
      </button>
    </div>
  );
};

export default SeniorCard;
