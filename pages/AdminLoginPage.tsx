
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { Lock, Banana } from 'lucide-react';

const AdminLoginPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setAdminStatus, state } = useApp();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '143897') {
      setAdminStatus(true);
      navigate('/admin');
    } else {
      setError('Invalid password. Access denied.');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className={`w-full max-w-md p-8 rounded-3xl shadow-2xl transition-all ${state.isDarkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg rotate-12">
            <Lock className="text-black" size={32} />
          </div>
          <h1 className="text-2xl font-black">Admin Access</h1>
          <p className={`${state.isDarkMode ? 'text-zinc-500' : 'text-zinc-400'} text-sm mt-2`}>Enter the secret code to manage Banana Manga</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${state.isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${
                state.isDarkMode 
                  ? 'bg-zinc-800 focus:ring-2 focus:ring-yellow-400/50' 
                  : 'bg-zinc-100 focus:ring-2 focus:ring-yellow-400'
              }`}
              placeholder="••••••"
              autoFocus
            />
          </div>

          {error && <p className="text-red-500 text-sm font-medium text-center bg-red-500/10 py-2 rounded-lg">{error}</p>}

          <button
            type="submit"
            className="w-full py-4 bg-yellow-400 text-black font-black rounded-xl hover:bg-yellow-500 transition-all shadow-lg active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>Unlock Dashboard</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
