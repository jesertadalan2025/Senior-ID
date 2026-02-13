
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Phone, User, Calendar, MapPin, AlertTriangle, ArrowLeft } from 'lucide-react';
import { db } from '../db';
import { SeniorCitizen, SeniorStatus } from '../types';

const PublicProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [senior, setSenior] = useState<SeniorCitizen | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const timeout = setTimeout(() => {
      if (id) {
        const record = db.getSeniorById(id);
        setSenior(record || null);
      }
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Verifying Credentials...</p>
        </div>
      </div>
    );
  }

  if (!senior) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border">
          <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Record Not Found</h1>
          <p className="text-gray-500 mb-6">The ID you are attempting to verify is not registered in our database or may have been revoked.</p>
          <button 
            onClick={() => navigate('/scan')}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const isActive = senior.status === SeniorStatus.ACTIVE;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border">
          {/* Top Status Header */}
          <div className={`${isActive ? 'bg-green-600' : 'bg-red-600'} px-6 py-6 text-white text-center`}>
            {isActive ? (
              <ShieldCheck size={64} className="mx-auto mb-2 opacity-90" />
            ) : (
              <ShieldAlert size={64} className="mx-auto mb-2 opacity-90" />
            )}
            <h1 className="text-3xl font-bold uppercase tracking-widest">
              {isActive ? 'Verified Record' : 'Inactive Record'}
            </h1>
            <p className="text-white text-opacity-80 text-sm font-medium">Official Digital Verification Page</p>
          </div>

          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-8 pb-8 border-b">
              <img 
                src={senior.photoUrl || `https://picsum.photos/seed/${senior.id}/300`} 
                alt="Senior Citizen" 
                className="w-48 h-48 rounded-2xl object-cover border-4 border-white shadow-lg -mt-16 md:-mt-20 z-10"
              />
              <div className="text-center md:text-left pt-2">
                <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">
                  {senior.firstName} {senior.lastName}
                </h2>
                <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-mono font-bold">
                    {senior.seniorId}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    Status: {senior.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mr-3">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Date of Birth</p>
                    <p className="text-gray-900 font-semibold">{new Date(senior.dob).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mr-3">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Home Address</p>
                    <p className="text-gray-900 font-semibold">{senior.address}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mr-3">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contact Number</p>
                    <p className="text-gray-900 font-semibold">{senior.contactNumber}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-red-50 p-2 rounded-lg text-red-600 mr-3">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Emergency Contact</p>
                    <p className="text-gray-900 font-bold">{senior.emergencyContact}</p>
                    <a href={`tel:${senior.emergencyPhone}`} className="text-red-600 font-bold hover:underline">
                      {senior.emergencyPhone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 p-4 bg-gray-50 rounded-xl border flex items-center justify-between">
              <div className="flex items-center text-xs text-gray-500">
                <ShieldCheck size={16} className="mr-2 text-green-500" />
                This is an encrypted official record.
              </div>
              <div className="text-[10px] text-gray-400 uppercase font-bold">
                Issued: {new Date(senior.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center no-print">
          <button 
            onClick={() => navigate('/scan')}
            className="text-gray-500 hover:text-indigo-600 flex items-center justify-center mx-auto transition-colors font-medium"
          >
            <ArrowLeft size={18} className="mr-2" />
            Scan another ID
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
