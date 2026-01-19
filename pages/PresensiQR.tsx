import React, { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '../supabaseClient';
import { Guru } from '../types';

interface PresensiQRProps {
  user: Guru;
}

const PresensiQR: React.FC<PresensiQRProps> = ({ user }) => {
  const [scanning, setScanning] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [activity, setActivity] = useState('');
  
  useEffect(() => {
    let scanner: Html5Qrcode | null = null;

    if (scanning) {
      scanner = new Html5Qrcode("reader");
      scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleScan(decodedText);
        },
        (errorMessage) => {
          // ignore errors
        }
      ).catch(err => {
        console.error("Camera error", err);
        setScanning(false);
      });
    }

    return () => {
      if (scanner && scanner.isScanning) {
        scanner.stop().then(() => scanner?.clear());
      }
    };
  }, [scanning]);

  const handleScan = async (nis: string) => {
    // Prevent spamming
    if (!activity) {
      alert("Pilih kegiatan dulu!");
      setScanning(false);
      return;
    }

    // Insert to DB
    const { data: siswa } = await supabase
      .from('data_siswa')
      .select('nama, kelas')
      .eq('nis', nis)
      .single();

    if (siswa) {
      const { error } = await supabase.from('data_presensi_qr').insert({
        nis: nis,
        nama: siswa.nama,
        kelas: siswa.kelas,
        jenis_kegiatan: activity,
        guru_input: user.nama,
        status_wa: 'Pending'
      });

      if (!error) {
        setLogs(prev => [{ nis, nama: siswa.nama, time: new Date().toLocaleTimeString() }, ...prev]);
        // alert(`Berhasil: ${siswa.nama}`); 
        // Pause scan briefly?
      }
    } else {
      alert("Siswa tidak ditemukan");
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <label className="block text-xs font-bold text-gray-400 mb-1">JENIS KEGIATAN</label>
        <select 
          value={activity} 
          onChange={e => setActivity(e.target.value)}
          className="w-full bg-[#212529] text-white p-3 rounded border border-[#444] font-bold"
        >
          <option value="">-- Pilih --</option>
          <option value="Datang">Datang</option>
          <option value="Pulang">Pulang</option>
          <option value="Terlambat">Terlambat</option>
          <option value="Kegiatan Sekolah">Kegiatan Sekolah</option>
        </select>
      </div>

      <div className="bg-black rounded-lg overflow-hidden border border-[#444] mb-4 relative min-h-[300px] flex items-center justify-center">
        {!scanning && (
          <div className="text-center">
            <i className="fas fa-camera text-4xl text-gray-600 mb-2"></i>
            <p className="text-gray-500 text-sm">Kamera Mati</p>
          </div>
        )}
        <div id="reader" className={scanning ? 'w-full h-full' : 'hidden'}></div>
      </div>

      <button 
        onClick={() => setScanning(!scanning)}
        className={`w-full py-3 rounded-full font-bold mb-6 ${scanning ? 'bg-red-600' : 'bg-cyan-600'} text-white`}
      >
        {scanning ? 'STOP SCANNER' : 'MULAI SCANNER'}
      </button>

      <div className="bg-[#212529] rounded-lg p-3">
        <h3 className="text-yellow-500 font-oswald border-b border-gray-700 pb-2 mb-2">RIWAYAT SCAN</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {logs.map((l, i) => (
            <div key={i} className="flex justify-between text-sm border-b border-[#333] pb-1">
              <span className="text-white">{l.nama}</span>
              <span className="text-gray-400">{l.time}</span>
            </div>
          ))}
          {logs.length === 0 && <div className="text-gray-500 text-xs text-center">Belum ada data scan.</div>}
        </div>
      </div>
    </div>
  );
};

export default PresensiQR;