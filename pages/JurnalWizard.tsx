import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Guru, JadwalPelajaran, Siswa } from '../types';
import { getDayName, formatDate } from '../utils';

interface JurnalWizardProps {
  user: Guru;
  onFinish: () => void;
}

const JurnalWizard: React.FC<JurnalWizardProps> = ({ user, onFinish }) => {
  const [step, setStep] = useState(1);
  const [schedules, setSchedules] = useState<JadwalPelajaran[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<JadwalPelajaran | null>(null);
  const [students, setStudents] = useState<(Siswa & { status: string })[]>([]);
  const [materi, setMateri] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load Schedules
  useEffect(() => {
    const loadSchedules = async () => {
      setLoading(true);
      const dayName = getDayName();
      const { data } = await supabase
        .from('jadwal_pelajaran')
        .select('*')
        .eq('nip', user.nip) // Or use name logic if preferred
        .eq('hari', dayName);
      
      if (data) setSchedules(data);
      setLoading(false);
    };
    loadSchedules();
  }, [user.nip]);

  // Load Students when schedule selected
  const handleScheduleSelect = async (schedule: JadwalPelajaran) => {
    setSelectedSchedule(schedule);
    setLoading(true);
    const { data } = await supabase
      .from('data_siswa')
      .select('*')
      .eq('kelas', schedule.kelas)
      .order('nama');
    
    if (data) {
      setStudents(data.map(s => ({ ...s, status: 'H' })));
    }
    setLoading(false);
    setStep(2);
  };

  const handleStatusChange = (nis: string, status: string) => {
    setStudents(prev => prev.map(s => s.nis === nis ? { ...s, status } : s));
  };

  const handleSubmit = async () => {
    if (!selectedSchedule) return;
    setSaving(true);

    try {
      const today = formatDate(new Date());
      const nowISO = new Date().toISOString();

      // 1. Insert Header Jurnal
      const { data: jurnalData, error: jurnalError } = await supabase
        .from('data_jurnal')
        .insert({
          waktu_input: nowISO,
          tanggal: today,
          nip_guru: user.nip,
          nama_guru: user.nama,
          kelas: selectedSchedule.kelas,
          mapel: selectedSchedule.mapel,
          jam_ke: selectedSchedule.jam_ke,
          materi: materi,
          detail_absensi: JSON.stringify(students.map(s => ({ nis: s.nis, status: s.status }))),
          status_kebersihan: 'Bersih', // Default
          status_kbm: 'Tatap Muka'
        })
        .select()
        .single();

      if (jurnalError || !jurnalData) throw new Error(jurnalError?.message || 'Gagal simpan jurnal');

      // 2. Insert Detail Absensi (only absent ones usually, or all)
      const absensiPayload = students
        .filter(s => s.status !== 'H') // Save only absent to save space, or all. Prompt SQL suggests logic.
        .map(s => ({
          tanggal: today,
          nis: s.nis,
          nama: s.nama,
          kelas: s.kelas,
          status: s.status,
          jam_ke: selectedSchedule.jam_ke,
          id_jurnal: jurnalData.id_jurnal
        }));

      if (absensiPayload.length > 0) {
        const { error: absError } = await supabase
          .from('jurnal_absensi')
          .insert(absensiPayload);
        if (absError) throw new Error(absError.message);
      }

      alert('Jurnal Berhasil Disimpan!');
      onFinish();

    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 pb-20 pt-4">
      {/* Step Indicators */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded ${step >= i ? 'bg-yellow-500' : 'bg-gray-700'}`}></div>
        ))}
      </div>

      {step === 1 && (
        <div className="animate-fade-in">
          <h2 className="text-yellow-500 font-oswald text-xl mb-4">1. PILIH JADWAL</h2>
          {loading ? <div className="text-center text-gray-400">Memuat jadwal...</div> : (
            <div className="space-y-3">
              {schedules.length === 0 && <div className="text-center text-gray-500">Tidak ada jadwal hari ini.</div>}
              {schedules.map(s => (
                <div 
                  key={s.id}
                  onClick={() => handleScheduleSelect(s)}
                  className="bg-[#212529] border border-[#343a40] p-4 rounded-lg active:scale-95 transition-transform cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-yellow-500 font-bold text-lg">{s.kelas}</div>
                      <div className="text-white">{s.mapel}</div>
                    </div>
                    <div className="bg-[#151922] px-2 py-1 rounded text-xs text-gray-400 border border-[#333]">
                      Jam {s.jam_ke}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-yellow-500 font-oswald text-xl">2. PRESENSI SISWA</h2>
            <button onClick={() => setStep(1)} className="text-sm text-gray-400">Ganti</button>
          </div>
          
          <div className="mb-4">
            <label className="text-xs text-gray-400 font-bold">MATERI PEMBELAJARAN</label>
            <textarea 
              className="w-full bg-[#212529] border border-[#444] rounded p-2 text-white mt-1 h-20"
              placeholder="Isi materi..."
              value={materi}
              onChange={e => setMateri(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            {loading ? <div className="text-center">Memuat siswa...</div> : students.map((s, idx) => (
              <div key={s.nis} className="bg-[#212529] border border-[#343a40] p-3 rounded flex flex-col gap-2">
                <div className="flex justify-between">
                  <div className="font-bold text-sm text-gray-300">{idx+1}. {s.nama}</div>
                  <div className="text-xs text-gray-500">{s.nis}</div>
                </div>
                <div className="flex gap-1">
                  {['H', 'S', 'I', 'A', 'D', 'T'].map(code => (
                    <button
                      key={code}
                      onClick={() => handleStatusChange(s.nis, code)}
                      className={`flex-1 py-2 rounded text-xs font-bold transition-colors ${
                        s.status === code 
                          ? (code === 'H' ? 'bg-green-600 text-white' : 'bg-yellow-500 text-black')
                          : 'bg-[#151922] text-gray-500 border border-[#333]'
                      }`}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={handleSubmit}
            disabled={saving || !materi}
            className="w-full mt-6 bg-green-600 hover:bg-green-500 text-white font-oswald py-4 rounded-xl text-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'MENYIMPAN...' : 'KIRIM JURNAL'}
          </button>
        </div>
      )}
    </div>
  );
};

export default JurnalWizard;