import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Guru } from '../types';

interface LoginProps {
  onSuccess: (guru: Guru) => void;
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess, onBack }) => {
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('data_guru')
        .select('*')
        .eq('nip', nip)
        .eq('password', password) // Note: In production, hash passwords!
        .single();

      if (error || !data) {
        throw new Error('NIP atau Password salah');
      }

      onSuccess(data as Guru);
    } catch (err: any) {
      setError(err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="bg-[#212529] border border-[#444] rounded-lg p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-2">
          <h2 className="text-xl font-oswald text-yellow-500">LOGIN GURU</h2>
          <button onClick={onBack} className="text-gray-400 hover:text-white">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-200 px-3 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">NIP / ID GURU</label>
            <input
              type="text"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              className="w-full bg-[#1c2024] border border-[#444] rounded p-2 text-white focus:border-yellow-500 focus:outline-none"
              placeholder="Masukkan NIP..."
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1c2024] border border-[#444] rounded p-2 text-white focus:border-yellow-500 focus:outline-none"
              placeholder="Masukkan Password..."
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold font-oswald py-3 rounded-full transition-colors disabled:opacity-50"
          >
            {loading ? 'MEMVERIFIKASI...' : 'MASUK SISTEM'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;