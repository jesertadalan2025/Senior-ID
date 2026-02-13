
import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check } from 'lucide-react';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  initialImage?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, initialImage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && initialImage && initialImage.startsWith('data:image')) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const img = new Image();
      img.onload = () => {
        // Clear before drawing initial to avoid ghosting
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = initialImage;
    }
  }, [initialImage]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      // Small delay to ensure last stroke is rendered
      setTimeout(() => {
        onSave(canvas.toDataURL('image/png'));
      }, 10);
    }
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.beginPath(); // Start new path for next stroke
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#065f46'; // emerald-800

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onSave('');
    }
  };

  return (
    <div className="flex flex-col space-y-2 w-full">
      <div className="relative border-2 border-emerald-100 rounded-2xl overflow-hidden bg-white shadow-inner group">
        <canvas
          ref={canvasRef}
          width={400}
          height={180}
          className="cursor-crosshair w-full h-[140px] md:h-[180px] touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        <div className="absolute top-3 right-3 flex space-x-2">
           <button 
            type="button"
            onClick={clear}
            className="p-2.5 bg-white text-red-500 rounded-xl hover:bg-red-50 transition-all shadow-md border border-gray-100 flex items-center justify-center"
            title="Clear Canvas"
           >
             <Eraser size={18} />
           </button>
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none opacity-20 transition-opacity group-hover:opacity-10">
           <span className="text-[10px] font-black uppercase text-emerald-900 tracking-[0.3em]">Signature Area</span>
        </div>
      </div>
      <div className="flex justify-between items-center px-2">
        <p className="text-[9px] text-emerald-600 font-bold uppercase italic">Sign inside the box manually</p>
        <div className="flex items-center space-x-1">
          <Check size={10} className="text-emerald-500" />
          <span className="text-[8px] font-black text-gray-400 uppercase">Interactive Pad V1.0</span>
        </div>
      </div>
    </div>
  );
};

export default SignaturePad;
