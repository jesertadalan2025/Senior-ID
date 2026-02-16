
import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { SeniorCitizen, SeniorStatus } from '../types';
import { Printer, Download } from 'lucide-react';
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
          pixelRatio: 4, // High resolution for physical printing
          backgroundColor: '#ffffff'
        });
        const link = document.createElement('a');
        link.download = `PALUAN-OSCA-ID-${senior.lastName}-${senior.seniorId}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Failed to generate image:', err);
        alert('Could not generate ID image. Please try the Print option instead.');
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
      {/* The ID Card Container */}
      <div className="id-card-print-area">
        <div 
          ref={cardRef}
          className="w-[430px] h-[272px] print:w-[85.6mm] print:h-[53.98mm] bg-white rounded-[1.2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-emerald-600/30 overflow-hidden relative flex flex-col font-sans mb-4 print:shadow-none print:border print:border-emerald-700 print:m-0 print:rounded-none select-none"
        >
          
          {/* Holographic Gloss Overlay (Digital Only) */}
          <div className="absolute inset-0 pointer-events-none z-20 opacity-30 no-print" 
               style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.2) 100%)' }}>
          </div>

          {/* Middle Logo Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] z-0">
            <img src={sealUrl} alt="Watermark" className="w-56 h-56 print:w-40 print:h-40 object-contain" />
          </div>

          {/* Top Header Section */}
          <div className="bg-emerald-800 h-24 print:h-[18mm] w-full flex items-center px-4 z-10 border-b-2 border-yellow-400 shadow-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.15),transparent)] pointer-events-none"></div>
            
            <img 
              src={sealUrl}
              alt="Paluan Seal" 
              className="w-16 h-16 print:w-12 print:h-12 object-contain mr-3 bg-white rounded-full p-1 shadow-lg ring-2 ring-emerald-900/10"
              onError={(e) => {
                 (e.target as any).src = 'https://via.placeholder.com/100?text=LOGO';
              }}
            />
            <div className="flex flex-col flex-1 text-white">
              <span className="text-[8px] print:text-[6px] font-bold uppercase leading-none opacity-80 tracking-tight">Republic of the Philippines</span>
              <span className="text-[8px] print:text-[6px] font-bold uppercase leading-none opacity-80 tracking-tight">Province of Occidental Mindoro</span>
              <span className="text-[14px] print:text-[11px] font-black uppercase leading-tight mt-0.5 tracking-tighter">MUNICIPALITY OF PALUAN</span>
              <span className="text-[9px] print:text-[7px] font-black text-yellow-300 uppercase leading-none mt-1 tracking-widest">Office of Senior Citizen Affairs</span>
            </div>
            <div className="flex flex-col items-end">
              <div className="bg-yellow-400 text-emerald-900 text-[8px] print:text-[6px] font-black px-2.5 py-1 rounded-sm uppercase mb-1 shadow-sm border border-yellow-500">Official ID</div>
              <span className="text-[11px] print:text-[9px] font-mono font-black text-white bg-emerald-950 px-2 py-1 rounded-md border border-white/20">{senior.seniorId || 'CT-000000'}</span>
            </div>
          </div>

          {/* Main Body */}
          <div className="flex p-3 print:p-2.5 flex-1 z-10 relative bg-gradient-to-b from-white to-emerald-50/20">
            {/* Left Column: Photo & QR */}
            <div className="flex flex-col items-center w-28 print:w-22 flex-shrink-0 mr-4 print:mr-3">
              <div className="w-24 h-24 print:w-20 print:h-20 border-[3px] border-emerald-800 bg-white flex-shrink-0 mb-1.5 flex items-center justify-center overflow-hidden shadow-xl rounded-sm">
                {senior.photoUrl ? (
                  <img src={senior.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[7px] text-emerald-300 text-center uppercase font-black bg-emerald-50">1x1 PHOTO</div>
                )}
              </div>
              
              <div className="text-center mb-1">
                <p className="text-[6px] text-emerald-700 font-black uppercase leading-none tracking-tighter">Issue Date</p>
                <p className="text-[9px] print:text-[8px] font-black text-gray-900">{formattedDate}</p>
              </div>

              <div className="mt-auto p-1 bg-white border border-emerald-200 rounded-md shadow-sm ring-2 ring-emerald-50">
                <QRCodeSVG value={verificationUrl} size={42} className="print:w-9 print:h-9" />
              </div>
            </div>

            {/* Right Column: Details */}
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="space-y-1.5 print:space-y-1">
                <div className="flex flex-col">
                  <span className="text-[7px] print:text-[5px] font-black text-emerald-700 uppercase leading-none tracking-widest">Name of Senior Citizen</span>
                  <h2 className="text-[15px] print:text-[12px] font-black text-slate-900 leading-tight truncate tracking-tight">
                    {senior.lastName}, {senior.firstName} {senior.middleName} {senior.suffix}
                  </h2>
                </div>

                <div className="flex flex-col">
                  <span className="text-[7px] print:text-[5px] font-black text-emerald-700 uppercase leading-none tracking-widest">Residential Address</span>
                  <p className="text-[9px] print:text-[8px] font-bold text-slate-700 leading-tight line-clamp-2 min-h-[20px] print:min-h-[16px] tracking-tighter">{senior.address || 'N/A'}</p>
                </div>

                <div className="flex items-center space-x-5">
                   <div className="flex flex-col">
                      <span className="text-[7px] print:text-[5px] font-black text-emerald-700 uppercase leading-none tracking-widest">Contact No.</span>
                      <p className="text-[11px] print:text-[9px] font-black text-slate-900">{senior.contactNumber || 'N/A'}</p>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[7px] print:text-[5px] font-black text-emerald-700 uppercase leading-none tracking-widest">Gender</span>
                      <p className="text-[11px] print:text-[9px] font-black text-slate-900 uppercase">{senior.gender || '---'}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                     <span className="text-[7px] print:text-[5px] font-black text-emerald-700 uppercase leading-none tracking-widest">Birth Date</span>
                     <p className="text-[11px] print:text-[9px] font-black text-slate-900 uppercase">{senior.dob ? new Date(senior.dob).toLocaleDateString() : '---'}</p>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[7px] print:text-[5px] font-black text-red-600 uppercase leading-none tracking-widest">Age</span>
                     <p className="text-[11px] print:text-[9px] font-black text-red-600 uppercase">{calculateAge(senior.dob)} Years</p>
                  </div>
                </div>
              </div>

              {/* Signature Area */}
              <div className="flex items-end justify-between border-t border-emerald-200 pt-2 mt-auto">
                 <div className="flex flex-col items-center">
                   <div className="h-11 w-36 print:h-8 print:w-28 relative flex items-center justify-center bg-white border border-emerald-100/50 rounded-lg shadow-inner">
                     {senior.signatureUrl ? (
                       <img src={senior.signatureUrl} alt="Sign" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                     ) : (
                       <div className="w-full border-b border-emerald-300 h-4 mx-2"></div>
                     )}
                   </div>
                   <span className="text-[6px] print:text-[5px] font-black text-emerald-800 uppercase mt-1 tracking-[0.2em]">Signature</span>
                 </div>
                 
                 <div className="flex flex-col items-end">
                    <div className={`px-2.5 py-1 rounded-full text-[7px] print:text-[6px] font-black uppercase border shadow-sm mb-1 ${
                      senior.status === SeniorStatus.ACTIVE ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      {senior.status}
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="bg-emerald-950 h-3 print:h-2 w-full flex justify-between px-3 items-center">
             <span className="text-[6px] print:text-[4px] text-emerald-400 font-mono uppercase tracking-widest">SECURE PALUAN OSCA ID SYSTEM • VER 2.5.1</span>
             <span className="text-[6px] print:text-[4px] text-emerald-400 font-mono">ENCRYPTED BINARY</span>
          </div>
        </div>
      </div>
      
      {/* UI Action Buttons */}
      <div className="no-print flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-sm px-4">
        <button 
          onClick={handlePrint}
          className="flex-1 flex items-center justify-center bg-emerald-800 hover:bg-emerald-900 text-white px-6 py-4 rounded-2xl text-[10px] font-black transition-all shadow-xl hover:scale-105 active:scale-95 uppercase tracking-widest border-2 border-emerald-600/50"
        >
          <Printer size={18} className="mr-3" />
          Print ID Card
        </button>
        <button 
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center bg-white hover:bg-slate-50 text-emerald-900 px-6 py-4 rounded-2xl text-[10px] font-black transition-all shadow-xl hover:scale-105 active:scale-95 uppercase tracking-widest border-2 border-slate-200"
        >
          <Download size={18} className="mr-3" />
          Download PNG
        </button>
      </div>
      <p className="no-print text-[9px] text-slate-400 font-black uppercase mt-6 tracking-[0.3em] opacity-50 text-center">
        CR80 Standard Compliance: 85.6mm x 54mm
      </p>
    </div>
  );
};

export default SeniorCard;
