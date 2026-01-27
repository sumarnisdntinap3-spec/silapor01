
export enum UserRole {
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  BIDANG = 'BIDANG'
}

export interface Bidang {
  id: string;
  nama: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  password?: string; // Menambahkan password
  bidangId?: string; // Khusus untuk Kepala Bidang
}

export type LaporanStatus = 'Terkirim' | 'Dibaca' | 'Diterima' | 'Ditindaklanjuti';

export interface LaporanFoto {
  id: string;
  url: string; // Base64 string for simulation
}

export interface Laporan {
  id: string;
  userId: string;
  userName: string;
  bidangId: string;
  namaSekolah: string;
  jenjang: 'TK' | 'SD' | 'SMP' | string;
  kecamatan: string;
  tanggalKunjungan: string;
  uraianTemuan: string;
  rekomendasi: string;
  status: LaporanStatus;
  fotos: LaporanFoto[];
  createdAt: string;
  updatedAt: string;
  feedbackKabid?: string;
}

export interface AppState {
  users: User[];
  bidang: Bidang[];
  laporan: Laporan[];
}
