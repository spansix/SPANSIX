import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Guru, Siswa, DataIzin } from '../types';

interface WaliKelasProps {
  user: Guru;
}

const WaliKelasModule: React.FC<WaliKelasProps> = ({ user }) => {
  const [tab, setTab] = useState<'izin' | 'absen'>('izin');
  const [students, setStudents] = useState<Siswa[]>([]);
  const [izins, setIzins] = useState<DataIzin[]>([]);
  
  // Logic to determine class based on role. 
  // In Supabase schema, `data_guru` doesn't explicitly store class name in a column 'kelas_wali', 
  // but the prompt's GAS code logic parsed it from the role string (e.g. 'wali_kelas 7A').
  // We will assume `user.role` or `user.nama` implies it, or verify against a mapping if it existed.
  // For this demo, let's assume we query students where class matches user input or a derived state.
  // To make it functional, let's fetch a class list and let them pick if they are admin, or hardcode/detect.
  // The provided SQL doesn't have a `kelas_wali` column in `data_guru`. 
  // We'll add a simple selector for demo purposes if the user is 'wali_kelas'.
  
  const [selectedClass, setSelectedClass] = useState('7A'); // Default

  useEffect(() => {
    // Fetch students for the class
    const fetchStudents = async () => {
      const { data } = await supabase.from('data_siswa').select('*').eq('kelas', selectedClass);
      if (data) setStudents(data);
    };
    
    // Fetch Izin for the class
    const fetchIzin = async () => {
      const { data } = await supabase.from('data_izin').select('*').eq('kelas', selectedClass).order('timestamp', {ascending: false});
      if (data) setIzins(data);
    };

    fetchStudents();
    fetchIzin();
  }, [selectedClass]);

  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    mulai: '',
    selesai: '',
    jenis: 'Sakit',
    ket: ''
  });

  const handleIzinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama) return;

    const { error } = await supabase.from('data_izin').insert({
      kelas: selectedClass,
      nama_siswa: formData.nama,
      tgl_mulai: formData.mulai,
      tgl_selesai: formData.selesai,
      jenis: formData.jenis,
      keterangan: formData.ket,
      file_url: '' // simplified
    });

    if (!error) {
      alert('Izin Disimpan');
      // Refresh list logic here
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4 overflow-x-auto">
        <button onClick={() => setTab('izin')} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${tab === 'izin' ? 'bg-yellow-500 text-black' : 'bg-[#212529] text-gray-400'}`}>PERIZINAN</button>
        <button onClick={() => setTab('absen')} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${tab === 'absen' ? 'bg-yellow-500 text-black' : 'bg-[#212529] text-gray-400'}`}>REKAP ABSEN</button>
      </div>

      <div className="mb-4">
        <label className="text-xs text-gray-500">KELAS WALI</label>
        <select 
          value={selectedClass} 
          onChange={e => setSelectedClass(e.target.value)}
          className="bg-[#212529] text-white p-2 rounded border border-[#444] ml-2"
        >
          <option value="7A">7A</option>
          <option value="7B">7B</option>
          {/* Add more options */}
        </select>
      </div>

      {tab === 'izin' && (
        <div>
          <div className="bg-[#212529] p-4 rounded-lg border border-[#444] mb-6">
            <h3 className="text-yellow-500 font-oswald mb-3">TAMBAH IZIN BARU</h3>
            <form onSubmit={handleIzinSubmit} className="space-y-3">
              <select 
                className="w-full bg-[#1c2024] p-2 rounded text-white border border-[#444]"
                value={formData.nama}
                onChange={e => setFormData({...formData, nama: e.target.value})}
                required
              >
                <option value="">-- Pilih Siswa --</option>
                {students.map(s => <option key={s.nis} value={s.nama}>{s.nama}</option>)}
              </select>
              <div className="flex gap-2">
                <input type="date" className="flex-1 bg-[#1c2024] p-2 rounded text-white border border-[#444]" required onChange={e => setFormData({...formData, mulai: e.target.value})} />
                <input type="date" className="flex-1 bg-[#1c2024] p-2 rounded text-white border border-[#444]" required onChange={e => setFormData({...formData, selesai: e.target.value})} />
              </div>
              <select 
                className="w-full bg-[#1c2024] p-2 rounded text-white border border-[#444]"
                value={formData.jenis}
                onChange={e => setFormData({...formData, jenis: e.target.value})}
              >
                <option value="Sakit">Sakit</option>
                <option value="Izin">Izin</option>
                <option value="Dispensasi">Dispensasi</option>
              </select>
              <textarea 
                className="w-full bg-[#1c2024] p-2 rounded text-white border border-[#444]"
                placeholder="Keterangan..."
                value={formData.ket}
                onChange={e => setFormData({...formData, ket: e.target.value})}
              />
              <button type="submit" className="w-full bg-green-600 py-2 rounded text-white font-bold">SIMPAN</button>
            </form>
          </div>

          <div className="space-y-2">
            <h3 className="text-gray-400 font-oswald text-sm">RIWAYAT IZIN</h3>
            {izins.map(i => (
              <div key={i.id} className="bg-[#212529] p-3 rounded border-l-4 border-yellow-500">
                <div className="font-bold text-white">{i.nama_siswa}</div>
                <div className="text-xs text-yellow-500 font-bold">{i.jenis}</div>
                <div className="text-xs text-gray-400">{i.tgl_mulai} s.d {i.tgl_selesai}</div>
                <div className="text-sm text-gray-300 mt-1 italic">"{i.keterangan}"</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'absen' && (
        <div className="text-center text-gray-500 py-10">
          Fitur Rekap Absensi sedang dikembangkan.
        </div>
      )}
    </div>
  );
};

export default WaliKelasModule;