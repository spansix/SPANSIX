import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { DashboardStats } from '../types';
import { formatDisplayDate, formatTime, formatDate } from '../utils';
import StatCard from '../components/StatCard';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface PublicDashboardProps {
  onLoginClick: () => void;
}

const PublicDashboard: React.FC<PublicDashboardProps> = ({ onLoginClick }) => {
  const [time, setTime] = useState(new Date());
  const [stats, setStats] = useState<DashboardStats>({
    totalMurid: 0,
    absensi: { S: 0, I: 0, A: 0, D: 0, T: 0 },
    missingJurnal: [],
    progress: 0
  });
  const [loading, setLoading] = useState(true);
  const [missingIndex, setMissingIndex] = useState(0);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const today = formatDate(new Date());
      
      // 1. Get Jurnal for today
      const { data: jurnals } = await supabase
        .from('data_jurnal')
        .select('*')
        .eq('tanggal', today);

      // 2. Get Absensi for today
      const { data: absensi } = await supabase
        .from('jurnal_absensi')
        .select('status')
        .eq('tanggal', today);

      // 3. Get Schedules for today
      // Note: This requires day mapping. For simplicity, we'll fetch all and filter client side
      // In a real optimized app, this would be a specific query or RPC.
      // Assuming today is valid day name
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const dayName = days[new Date().getDay()];
      
      const { data: schedules } = await supabase
        .from('jadwal_pelajaran')
        .select('*')
        .eq('hari', dayName);

      const totalSchedules = schedules?.length || 0;
      const filledSchedules = jurnals?.length || 0; // Rough approximation
      const progress = totalSchedules === 0 ? 0 : Math.min(100, Math.round((filledSchedules / totalSchedules) * 100));

      // Calculate missing journals (Simple check)
      const missing = (schedules || [])
        .filter(s => !(jurnals || []).some(j => j.kelas === s.kelas && j.jam_ke === s.jam_ke && j.mapel === s.mapel))
        .map(s => ({
          guru: s.nama_guru,
          kelas: s.kelas,
          jam: s.jam_ke,
          mapel: s.mapel
        }));

      // Calculate Absensi Stats
      const absCounts = { S: 0, I: 0, A: 0, D: 0, T: 0 };
      absensi?.forEach((a: any) => {
        if (['S', 'I', 'A', 'D', 'T'].includes(a.status)) {
          absCounts[a.status as keyof typeof absCounts]++;
        }
      });

      setStats({
        totalMurid: 0, // Need fetch students count if needed, skipping for performace
        absensi: absCounts,
        missingJurnal: missing,
        progress
      });

    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Rotate missing journals
  useEffect(() => {
    if (stats.missingJurnal.length > 0) {
      const interval = setInterval(() => {
        setMissingIndex(prev => (prev + 1) % stats.missingJurnal.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [stats.missingJurnal]);

  // Chart Config
  const chartData = {
    labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'], // Mock labels
    datasets: [
      {
        label: 'Total Ketidakhadiran',
        data: [12, 19, 3, 5, 2, 3], // Mock data - would need history query
        borderColor: '#ffc107',
        backgroundColor: 'rgba(255, 193, 7, 0.5)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const, labels: { color: 'white' } },
      title: { display: false },
    },
    scales: {
      y: { ticks: { color: 'gray' }, grid: { color: '#333' } },
      x: { ticks: { color: 'gray' }, grid: { color: '#333' } }
    }
  };

  return (
    <div className="relative pb-20">
      {/* Header */}
      <div className="px-4 py-3 flex justify-between items-center bg-[#151922] sticky top-0 z-10 shadow-md">
        <div>
          <div className="text-4xl font-big leading-none text-white">{formatTime(time)}</div>
          <div className="text-sm font-oswald text-gray-400">{formatDisplayDate(time)}</div>
        </div>
        <div className="flex items-center gap-2">
          <img src="https://i.imghippo.com/files/Qcq8819wSM.png" className="h-10 w-auto object-contain" alt="Logo" />
        </div>
      </div>

      <div className="container mx-auto px-4 mt-2">
        {/* Jurnal Kosong Card */}
        <div className="bg-[#212529] border border-[#343a40] rounded-lg mb-4 p-4">
          <h6 className="text-yellow-500 font-bold text-xs uppercase tracking-wider mb-2 text-center">JURNAL KBM BELUM TERISI</h6>
          
          <div className="h-12 flex items-center justify-center overflow-hidden">
            {stats.missingJurnal.length > 0 ? (
              <div className="text-center w-full animate-fade-in">
                <div className="font-bold text-white text-sm truncate px-2">{stats.missingJurnal[missingIndex].guru}</div>
                <div className="text-xs text-red-400 font-mono mt-1 border-t border-[#333] pt-1 inline-block px-2">
                  <span className="text-yellow-500">{stats.missingJurnal[missingIndex].kelas}</span> | 
                  Jam {stats.missingJurnal[missingIndex].jam} | 
                  <span className="text-cyan-400 ml-1">{stats.missingJurnal[missingIndex].mapel}</span>
                </div>
              </div>
            ) : (
              <div className="text-green-500 font-bold text-sm"><i className="fas fa-check-circle mr-2"></i>SEMUA TUNTAS!</div>
            )}
          </div>

          <div className="w-full bg-[#333] h-1.5 mt-3 rounded-full overflow-hidden">
            <div className="bg-yellow-500 h-full transition-all duration-1000" style={{ width: `${stats.progress}%` }}></div>
          </div>
          <div className="flex justify-between mt-1 text-[10px]">
            <span className="text-gray-500">Progress Sekolah</span>
            <span className="text-yellow-500 font-bold">{stats.progress}% Terisi</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          <StatCard label="SAKIT" value={stats.absensi.S} colorClass="text-cyan-400" />
          <StatCard label="IZIN" value={stats.absensi.I} colorClass="text-yellow-500" />
          <StatCard label="ALPA" value={stats.absensi.A} colorClass="text-red-500" />
          <StatCard label="DISPEN" value={stats.absensi.D} colorClass="text-purple-500" />
          <StatCard label="TELAT" value={stats.absensi.T} colorClass="text-pink-500" />
        </div>

        {/* Grafik */}
        <div className="bg-[#212529] border border-[#343a40] rounded-lg mb-4">
          <div className="p-3 border-b border-[#343a40] flex justify-between items-center">
            <span className="text-white font-oswald text-sm"><i className="fas fa-chart-line mr-2 text-cyan-400"></i>GRAFIK TREN</span>
          </div>
          <div className="p-3">
            <Line options={chartOptions} data={chartData} height={200} />
          </div>
        </div>

      </div>

      {/* Floating Action Button for Login */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
        <button 
          onClick={onLoginClick}
          className="w-12 h-12 rounded-full bg-yellow-500 text-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <i className="fas fa-sign-in-alt text-lg"></i>
        </button>
      </div>
    </div>
  );
};

export default PublicDashboard;