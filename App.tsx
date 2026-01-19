import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Guru } from './types';
import PublicDashboard from './pages/PublicDashboard';
import Login from './pages/Login';
import TeacherArea from './pages/TeacherArea';

type Page = 'dashboard' | 'login' | 'teacher';

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [user, setUser] = useState<Guru | null>(null);

  // Check local storage for session
  useEffect(() => {
    const savedUser = localStorage.getItem('sjg_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setPage('teacher');
    }
  }, []);

  const handleLogin = (guru: Guru) => {
    localStorage.setItem('sjg_user', JSON.stringify(guru));
    setUser(guru);
    setPage('teacher');
  };

  const handleLogout = () => {
    localStorage.removeItem('sjg_user');
    setUser(null);
    setPage('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#151922] text-[#F0F8FF] font-sans pb-20">
      {page === 'dashboard' && (
        <PublicDashboard 
          onLoginClick={() => setPage('login')} 
        />
      )}
      
      {page === 'login' && (
        <Login 
          onSuccess={handleLogin} 
          onBack={() => setPage('dashboard')} 
        />
      )}

      {page === 'teacher' && user && (
        <TeacherArea 
          user={user} 
          onLogout={handleLogout}
          onBackToDashboard={() => setPage('dashboard')}
        />
      )}
    </div>
  );
}