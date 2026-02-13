
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, CameraOff, ArrowLeft, Search } from 'lucide-react';

declare const jsQR: any;

const QRScanner: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualId, setManualId] = useState('');
  const requestRef = useRef<number | null>(null);

  // Use a strictly typed timestamp parameter to satisfy TS2554
  const scan = (time: DOMHighResTimeStamp) => {
    if (videoRef.current && canvasRef.current && isScanning) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d', { willReadFrequently: true });

      if (video.readyState === video.HAVE_ENOUGH_DATA && context) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          // Look for verification ID in the URL format or raw ID
          const urlParts = code.data.split('/verify/');
          const detectedId = urlParts.length > 1 ? urlParts[1] : code.data;
          
          stopCamera();
          navigate(`/verify/${detectedId}`);
          return;
        }
      }
      requestRef.current = requestAnimationFrame(scan);
    }
  };

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
      }
    } catch (err) {
      console.error(err);
      setError('Could not access camera. Please ensure permissions are granted.');
    }
  };

  const stopCamera = () => {
    setIsScanning(false);
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  useEffect(() => {
    if (isScanning) {
      requestRef.current = requestAnimationFrame(scan);
    }
    return () => stopCamera();
  }, [isScanning]);

  const handleManualLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId.trim()) {
      navigate(`/verify/${manualId}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-tight">Secure Verification</h1>
        <p className="text-xs text-gray-500 mb-8 uppercase font-bold tracking-widest">Align the ID card's QR code within the viewfinder</p>

        <div className="relative aspect-square max-w-sm mx-auto bg-gray-900 rounded-3xl overflow-hidden mb-8 shadow-inner ring-4 ring-gray-50">
          <canvas ref={canvasRef} className="hidden" />
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white bg-gray-800">
              <CameraOff size={48} className="mb-4 text-red-400" />
              <p className="text-sm font-medium text-center">{error}</p>
              <button 
                onClick={startCamera}
                className="mt-4 px-4 py-2 bg-indigo-600 rounded-lg text-xs font-black uppercase"
              >
                Retry Camera
              </button>
            </div>
          ) : isScanning ? (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-64 h-64 border-2 border-white/50 border-dashed rounded-3xl animate-pulse flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full animate-ping" />
                 </div>
              </div>
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-white text-[8px] font-black uppercase tracking-widest">Scanner Active</span>
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <button 
                  onClick={stopCamera}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2 rounded-xl text-[10px] font-black transition-all border border-white/30 uppercase"
                >
                  Stop Camera
                </button>
              </div>
            </>
          ) : (
            <div 
              className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 cursor-pointer group hover:bg-gray-100 transition-colors" 
              onClick={startCamera}
            >
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Camera size={40} className="text-indigo-600" />
              </div>
              <span className="text-indigo-600 font-black uppercase text-xs">Tap to Start Scanner</span>
              <span className="text-gray-400 text-[9px] font-bold mt-1 uppercase">Camera access required</span>
            </div>
          )}
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-400 font-black uppercase tracking-widest text-[10px]">Manual Entry</span>
          </div>
        </div>

        <form onSubmit={handleManualLookup} className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Enter ID Number..."
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:ring-0 outline-none transition-all placeholder:text-gray-300 font-bold"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95"
          >
            Verify
          </button>
        </form>

        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">
          Verification ID is located on the back or bottom of the ID.
        </p>
      </div>
    </div>
  );
};

export default QRScanner;
