
import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Shield, Key, X, Check } from 'lucide-react';
import { db } from '../db';
import { UserAccount, UserRole } from '../types';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Omit<UserAccount, 'id' | 'createdAt'>>({
    username: '',
    password: '',
    role: 'Staff'
  });

  useEffect(() => {
    setUsers(db.getUsers());
  }, []);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserAccount = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now()
    };
    db.saveUser(newUser);
    setUsers(db.getUsers());
    setShowModal(false);
    setFormData({ username: '', password: '', role: 'Staff' });
  };

  const handleDelete = (id: string) => {
    const currentUser = db.getCurrentUser();
    if (currentUser?.id === id) {
      alert("You cannot delete your own account.");
      return;
    }
    if (confirm('Delete this user account?')) {
      db.deleteUser(id);
      setUsers(db.getUsers());
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-emerald-900 uppercase tracking-tight flex items-center">
            <Users className="mr-3 text-emerald-600" />
            System User Accounts
          </h1>
          <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest mt-1">Manage Paluan OSCA staff access levels</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center shadow-lg transition-all active:scale-95"
        >
          <UserPlus size={16} className="mr-2" />
          Add New User
        </button>
      </div>

      <div className="bg-white shadow-xl rounded-2xl border border-emerald-50 overflow-hidden">
        <table className="min-w-full divide-y divide-emerald-50">
          <thead className="bg-emerald-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-black text-emerald-600 uppercase tracking-widest">Username</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-emerald-600 uppercase tracking-widest">Access Role</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-emerald-600 uppercase tracking-widest">Created</th>
              <th className="px-6 py-4 text-right text-[10px] font-black text-emerald-600 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-50 bg-white">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-emerald-50/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-black text-emerald-900 uppercase">{user.username}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                    user.role === 'Admin' ? 'bg-indigo-100 text-indigo-700' : 
                    user.role === 'Staff' ? 'bg-emerald-100 text-emerald-700' : 
                    'bg-amber-100 text-amber-700'
                  }`}>
                    <Shield size={10} className="mr-1" />
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                   <button 
                    onClick={() => handleDelete(user.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                   >
                     <Trash2 size={18} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-emerald-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 border border-emerald-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-emerald-900 uppercase">New User Profile</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-emerald-900 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Login Username</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 font-bold"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">System Password</label>
                <div className="relative">
                  <Key size={18} className="absolute left-4 top-3.5 text-emerald-300" />
                  <input
                    type="password"
                    required
                    className="w-full pl-12 pr-4 py-3 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 font-bold"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Access Role</label>
                <div className="grid grid-cols-1 gap-2">
                  {(['Admin', 'Staff', 'QR Checker Staff'] as UserRole[]).map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({...formData, role})}
                      className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest border transition-all flex items-center justify-center ${
                        formData.role === role ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-emerald-200'
                      }`}
                    >
                      {formData.role === role && <Check size={14} className="mr-2" />}
                      {role}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-700 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs shadow-xl shadow-emerald-100 transition-all hover:bg-emerald-800 active:scale-95"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
