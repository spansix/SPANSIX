export interface Guru {
  nip: string;
  password: string;
  nama: string;
  role: 'admin' | 'guru' | 'wali_kelas' | 'bk' | 'piket';
  wa_guru?: string;
}

export interface Siswa {
  nis: string;
  nama: string;
  kelas: string;
  jenis_kelamin: 'L' | 'P';
  wa_siswa?: string;
  peminatan?: string;
}

export interface JadwalPelajaran {
  id: string;
  nip: string;
  nama_guru: string;
  hari: string;
  kelas: string;
  mapel: string;
  jam_ke: string;
}

export interface Jurnal {
  id_jurnal: string;
  waktu_input: string;
  tanggal: string;
  nip_guru: string;
  nama_guru: string;
  kelas: string;
  mapel: string;
  jam_ke: string;
  materi: string;
  detail_absensi: string; // JSON string
  data_kejadian: string;
  status_kebersihan: string;
  status_kbm: string;
}

export interface JurnalAbsensi {
  id: string;
  tanggal: string;
  nis: string;
  nama: string;
  kelas: string;
  status: 'S' | 'I' | 'A' | 'D' | 'T' | 'H';
  keterangan?: string;
  jam_ke: string;
  id_jurnal: string;
}

export interface PresensiQR {
  id: string;
  timestamp: string;
  jenis_kegiatan: string;
  nis: string;
  nama: string;
  kelas: string;
  guru_input: string;
  status_wa: string;
}

export interface DataIzin {
  id: string;
  timestamp: string;
  kelas: string;
  nama_siswa: string;
  tgl_mulai: string;
  tgl_selesai: string;
  jenis: string;
  keterangan: string;
  file_url: string;
}

export interface DataTindakLanjut {
  id: string;
  timestamp: string;
  kelas: string;
  nama_siswa: string;
  jenis_tindak: string;
  keterangan: string;
  file_url: string;
}

export interface DashboardStats {
  totalMurid: number;
  absensi: {
    S: number;
    I: number;
    A: number;
    D: number;
    T: number;
  };
  missingJurnal: {
    guru: string;
    kelas: string;
    jam: string;
    mapel: string;
  }[];
  progress: number;
}
