
import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { SeniorCitizen, SeniorStatus } from '../types';
import { Printer, Download, Image as ImageIcon } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

interface SeniorCardProps {
  senior: SeniorCitizen;
}

const SeniorCard: React.FC<SeniorCardProps> = ({ senior }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const verificationUrl = `${window.location.origin}${window.location.pathname}#/verify/${senior.id}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (cardRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(cardRef.current, {
          pixelRatio: 3, // High quality for printing
          backgroundColor: '#ffffff'
        });
        const link = document.createElement('a');
        link.download = `OSCA-ID-${senior.lastName}-${senior.seniorId}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('oops, something went wrong!', err);
      }
    }
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
      {/* The Printable/Downloadable ID Card Area */}
      <div className="id-card-print-area">
        <div 
          ref={cardRef}
          className="w-[430px] h-[270px] print:w-[85.6mm] print:h-[53.98mm] bg-white rounded-xl shadow-2xl border border-emerald-600 overflow-hidden relative flex flex-col font-sans mb-4 print:shadow-none print:border print:border-emerald-700 print:m-0 print:rounded-none select-none"
        >
          
          {/* Middle Logo Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.07] z-0">
            <img src={sealUrl} alt="Watermark" className="w-56 h-56 print:w-40 print:h-40 object-contain" />
          </div>

          {/* Top Header Section */}
          <div className="bg-emerald-800 h-24 print:h-[18mm] w-full flex items-center px-4 z-10 border-b border-emerald-900 shadow-sm relative overflow-hidden">
            {/* Gloss effect for header */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
            
            <img 
              src={sealUrl}
              alt="Paluan Seal" 
              className="w-16 h-16 print:w-12 print:h-12 object-contain mr-3 bg-white rounded-full p-1 shadow-md"
              onError={(e) => {
                 (e.target as any).src = 'https://via.placeholder.com/100?text=LOGO';
              }}
            />
            <div className="flex flex-col flex-1 text-white">
              <span className="text-[8px] print:text-[6px] font-medium uppercase leading-none opacity-80 tracking-tight">Republic of the Philippines</span>
              <span className="text-[8px] print:text-[6px] font-medium uppercase leading-none opacity-80 tracking-tight">Province of Occidental Mindoro</span>
              <span className="text-[13px] print:text-[10px] font-black uppercase leading-tight mt-0.5 tracking-tighter">MUNICIPALITY OF PALUAN</span>
              <span className="text-[9px] print:text-[7px] font-bold text-yellow-300 uppercase leading-none mt-1 tracking-widest">Office of Senior Citizen Affairs</span>
            </div>
            <div className="flex flex-col items-end">
              <div className="bg-yellow-400 text-emerald-900 text-[8px] print:text-[6px] font-black px-2 py-0.5 rounded-sm uppercase mb-1 shadow-sm border border-yellow-500">Official ID</div>
              <span className="text-[10px] print:text-[8px] font-mono font-black text-white bg-emerald-900/50 px-2 py-0.5 rounded border border-white/10">{senior.seniorId || 'CT-000000'}</span>
            </div>
          </div>

          {/* Main Body */}
          <div className="flex p-3 print:p-2.5 flex-1 z-10 relative">
            {/* Left Column: 1x1 Photo */}
            <div className="flex flex-col items-center w-28 print:w-20 flex-shrink-0 mr-3 print:mr-3">
              <div className="w-24 h-24 print:w-20 print:h-20 border-2 border-emerald-800 bg-white flex-shrink-0 mb-1.5 flex items-center justify-center overflow-hidden shadow-md">
                {senior.photoUrl ? (
                  <img src={senior.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[7px] text-emerald-300 text-center uppercase font-black bg-emerald-50">1x1 PHOTO</div>
                )}
              </div>
              
              <div className="text-center">
                <p className="text-[6px] text-emerald-600 font-black uppercase leading-none tracking-tighter">Date Issued</p>
                <p className="text-[8px] print:text-[7px] font-black text-gray-800">{formattedDate}</p>
              </div>

              <div className="mt-auto p-1 bg-white border border-emerald-100 rounded shadow-sm">
                <QRCodeSVG value={verificationUrl} size={40} className="print:w-8 print:h-8" />
              </div>
            </div>

            {/* Right Column: Details */}
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="space-y-1 print:space-y-0.5">
                <div className="flex flex-col">
                  <span className="text-[7px] print:text-[5px] font-bold text-emerald-600 uppercase leading-none">Name of Senior Citizen:</span>
                  <h2 className="text-[13px] print:text-[10px] font-black text-gray-900 leading-tight truncate tracking-tight">
                    {senior.lastName}, {senior.firstName} {senior.middleName} {senior.suffix}
                  </h2>
                </div>

                <div className="flex flex-col">
                  <span className="text-[7px] print:text-[5px] font-bold text-emerald-600 uppercase leading-none">Residential Address:</span>
                  <p className="text-[9px] print:text-[7px] font-bold text-gray-700 leading-tight line-clamp-2 min-h-[18px] print:min-h-[14px] uppercase">{senior.address || 'N/A'}</p>
                </div>

                <div className="flex items-center space-x-4">
                   <div className="flex flex-col">
                      <span className="text-[7px] print:text-[5px] font-bold text-emerald-600 uppercase leading-none">Contact No:</span>
                      <p className="text-[10px] print:text-[8px] font-black text-gray-800">{senior.contactNumber || 'N/A'}</p>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[7px] print:text-[5px] font-bold text-emerald-600 uppercase leading-none">Gender:</span>
                      <p className="text-[10px] print:text-[8px] font-black text-gray-800 uppercase">{senior.gender || '---'}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-1">
                  <div className="flex flex-col">
                     <span className="text-[7px] print:text-[5px] font-bold text-emerald-600 uppercase leading-none">Date of Birth:</span>
                     <p className="text-[10px] print:text-[8px] font-black text-gray-800 uppercase">{senior.dob ? new Date(senior.dob).toLocaleDateString() : '---'}</p>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[7px] print:text-[5px] font-bold text-emerald-600 uppercase leading-none text-red-600">Current Age:</span>
                     <p className="text-[10px] print:text-[8px] font-black text-red-600 uppercase">{calculateAge(senior.dob)} Years Old</p>
                  </div>
                </div>
              </div>

              {/* Signature Area */}
              <div className="flex items-end justify-between border-t border-emerald-100 pt-1.5 mt-auto">
                 <div className="flex flex-col items-center">
                   <div className="h-10 w-32 print:h-8 print:w-24 relative flex items-center justify-center bg-emerald-50/20 rounded">
                     {senior.signatureUrl ? (
                       <img src={senior.signatureUrl} alt="Sign" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                     ) : (
                       <div className="w-full border-b border-emerald-300 h-4"></div>
                     )}
                   </div>
                   <span className="text-[6px] print:text-[5px] font-black text-emerald-600 uppercase mt-0.5">Holder's Signature</span>
                 </div>
                 
                 <div className="flex flex-col items-end">
                    <div className={`px-2 py-0.5 rounded-md text-[7px] print:text-[6px] font-black uppercase border mb-1 ${
                      senior.status === SeniorStatus.ACTIVE ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {senior.status}
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="bg-emerald-900 h-2.5 print:h-1.5 w-full flex justify-between px-3 items-center">
             <span className="text-[6px] print:text-[4px] text-white/50 font-mono uppercase tracking-tighter">SECURE PALUAN OSCA ID SYSTEM • DIGITAL VERIFIED</span>
             <span className="text-[6px] print:text-[4px] text-white/50 font-mono">2.5.0-RELEASE</span>
          </div>
        </div>
      </div>
      
      {/* UI Action Buttons - Hidden during print */}
      <div className="no-print flex flex-col sm:flex-row gap-3 mt-6">
        <button 
          onClick={handlePrint}
          className="flex items-center justify-center bg-emerald-800 hover:bg-emerald-900 text-white px-8 py-3.5 rounded-2xl text-xs font-black transition-all shadow-xl hover:scale-105 active:scale-95 uppercase tracking-widest border-2 border-emerald-600"
        >
          <Printer size={18} className="mr-2" />
          Print PVC Card
        </button>
        <button 
          onClick={handleDownload}
          className="flex items-center justify-center bg-white hover:bg-slate-50 text-emerald-800 px-8 py-3.5 rounded-2xl text-xs font-black transition-all shadow-xl hover:scale-105 active:scale-95 uppercase tracking-widest border-2 border-emerald-100"
        >
          <Download size={18} className="mr-2" />
          Download PNG
        </button>
      </div>
      <p className="no-print text-[10px] text-slate-400 font-bold uppercase mt-4 tracking-widest">
        Standard CR80 Size: 85.6mm x 54mm
      </p>
    </div>
  );
};

export default SeniorCard;
