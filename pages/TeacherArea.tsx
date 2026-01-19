import React, { useState } from 'react';
import { Guru } from '../types';
import JurnalWizard from './JurnalWizard';
import PresensiQR from './PresensiQR';
import WaliKelasModule from './WaliKelas';

interface TeacherAreaProps {
  user: Guru;
  onLogout: () => void;
  onBackToDashboard: () => void;
}

type View = 'menu' | 'jurnal' | 'qr' | 'wali' | 'jadwal' | 'laporan';

const TeacherArea: React.FC<TeacherAreaProps> = ({ user, onLogout }) => {
  const [view, setView] = useState<View>('menu');

  const MenuCard = ({ icon, label, onClick, color = "text-white" }: any) => (
    <div 
      onClick={onClick}
      className="bg-[#212529] border border-[#343a40] rounded-xl p-5 text-center cursor-pointer hover:bg-[#2b3035] transition-all active:scale-95 shadow-md flex flex-col items-center justify-center gap-3 h-32"
    >
      <i className={`${icon} text-3xl ${color}`}></i>
      <div className={`font-bold text-sm ${color}`}>{label}</div>
    </div>
  );

  const Header = ({ title, showBack = false }: { title?: string, showBack?: boolean }) => (
    <div className="bg-gradient-to-r from-[#212529] to-[#1a1d20] border-b border-yellow-600 p-3 sticky top-0 z-20 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          {showBack && (
            <button onClick={() => setView('menu')} className="text-gray-300 hover:text-white">
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
          )}
          {!showBack && <img src="https://i.imghippo.com/files/TgXx9582Ofc.png" className="h-10 w-auto rounded-full border-2 border-white" alt="Guru" />}
          <div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">SELAMAT DATANG</div>
            <div className="text-yellow-500 font-oswald font-bold text-lg leading-none truncate max-w-[200px]">
              {title || user.nama}
            </div>
          </div>
        </div>
        {!showBack && (
          <button onClick={onLogout} className="w-8 h-8 rounded-full border border-red-500 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
            <i className="fas fa-power-off text-xs"></i>
          </button>
        )}
      </div>
    </div>
  );

  if (view === 'jurnal') {
    return (
      <div className="min-h-screen bg-[#151922]">
        <Header title="INPUT JURNAL KBM" showBack />
        <JurnalWizard user={user} onFinish={() => setView('menu')} />
      </div>
    );
  }

  if (view === 'qr') {
    return (
      <div className="min-h-screen bg-[#151922]">
        <Header title="PRESENSI QR" showBack />
        <PresensiQR user={user} />
      </div>
    );
  }

  if (view === 'wali') {
    return (
      <div className="min-h-screen bg-[#151922]">
        <Header title="MENU WALI KELAS" showBack />
        <WaliKelasModule user={user} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#151922]">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        
        {/* Jadwal Hari Ini Preview */}
        <div className="bg-[#212529] rounded-lg border border-[#343a40] overflow-hidden mb-6">
          <div className="bg-[#2c3136] p-3 flex justify-between items-center">
            <span className="text-yellow-500 font-bold font-oswald">JADWAL HARI INI</span>
            <span className="text-xs bg-black/30 px-2 py-1 rounded text-gray-400">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long' })}
            </span>
          </div>
          <div className="p-4 text-center text-gray-500 text-sm italic">
            Silakan pilih menu "Isi Jurnal" untuk melihat detail.
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 gap-4">
          <MenuCard 
            icon="fas fa-book-open" 
            label="Isi Jurnal" 
            color="text-white"
            onClick={() => setView('jurnal')} 
          />
          <MenuCard 
            icon="fas fa-qrcode" 
            label="Presensi QR" 
            color="text-white"
            onClick={() => setView('qr')} 
          />
          {(user.role === 'wali_kelas' || user.role === 'admin') && (
            <MenuCard 
              icon="fas fa-user-graduate" 
              label="Wali Kelas" 
              color="text-green-500"
              onClick={() => setView('wali')} 
            />
          )}
          <MenuCard 
            icon="fas fa-calendar-alt" 
            label="Jadwalku" 
            color="text-cyan-400"
            onClick={() => alert("Fitur Jadwalku segera hadir")} 
          />
          <MenuCard 
            icon="fas fa-print" 
            label="Laporan" 
            color="text-gray-300"
            onClick={() => alert("Fitur Laporan segera hadir")} 
          />
          <MenuCard 
            icon="fas fa-cog" 
            label="Pengaturan" 
            color="text-gray-500"
            onClick={() => alert("Fitur Pengaturan segera hadir")} 
          />
        </div>
      </div>
    </div>
  );
};

export default TeacherArea;