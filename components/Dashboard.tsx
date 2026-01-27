
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, UserRole, Laporan, Bidang } from '../types';

interface DashboardProps {
  user: User;
  laporan: Laporan[];
  bidang: Bidang[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, laporan, bidang }) => {
  const [filterBidang, setFilterBidang] = useState<string>('all');

  // Filter laporan berdasarkan Role
  let filteredLaporan = laporan;
  if (user.role === UserRole.SUPERVISOR) {
    filteredLaporan = laporan.filter(l => l.userId === user.id);
  } else if (user.role === UserRole.BIDANG) {
    filteredLaporan = laporan.filter(l => l.bidangId === user.bidangId);
  }

  // Filter tambahan dari dropdown (untuk Admin)
  if (user.role === UserRole.ADMIN && filterBidang !== 'all') {
    filteredLaporan = filteredLaporan.filter(l => l.bidangId === filterBidang);
  }

  const stats = {
    total: filteredLaporan.length,
    pending: filteredLaporan.filter(l => l.status === 'Terkirim' || l.status === 'Dibaca').length,
    done: filteredLaporan.filter(l => l.status === 'Ditindaklanjuti').length,
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Dashboard Utama</h1>
          <p className="text-slate-500 font-medium">Selamat datang di sistem manajemen pelaporan Dinas Pendidikan.</p>
        </div>
        
        {user.role === UserRole.SUPERVISOR && (
          <Link to="/laporan/baru" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-transform active:scale-95 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Buat Laporan Kunjungan
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Total Laporan" value={stats.total} icon="📊" color="blue" />
        <StatCard label="Dalam Proses" value={stats.pending} icon="⏳" color="amber" />
        <StatCard label="Ditindaklanjuti" value={stats.done} icon="✅" color="emerald" />
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="font-black text-slate-800 uppercase tracking-widest text-sm flex items-center">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
            Daftar Laporan {user.role === UserRole.BIDANG ? 'Bidang Anda' : ''}
          </h2>
          
          {user.role === UserRole.ADMIN && (
            <select 
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold"
              value={filterBidang}
              onChange={e => setFilterBidang(e.target.value)}
            >
              <option value="all">Semua Bidang</option>
              {bidang.map(b => <option key={b.id} value={b.id}>{b.nama}</option>)}
            </select>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <tr>
                <th className="px-6 py-4">Sekolah & Tanggal</th>
                <th className="px-6 py-4">Pengawas</th>
                <th className="px-6 py-4">Bidang</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLaporan.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold">Belum ada data laporan.</td>
                </tr>
              ) : (
                filteredLaporan.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-800">{item.namaSekolah}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{new Date(item.tanggalKunjungan).toLocaleDateString('id-ID')}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-medium text-slate-600">{item.userName}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-black px-2 py-1 bg-slate-100 rounded-md text-slate-500 uppercase">
                        {bidang.find(b => b.id === item.bidangId)?.nama || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link to={`/laporan/${item.id}`} className="text-blue-600 hover:text-blue-800 font-black text-xs uppercase tracking-tighter">
                        Detail &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black text-slate-900">{value}</p>
    </div>
    <div className={`w-12 h-12 rounded-xl bg-${color}-50 flex items-center justify-center text-2xl`}>
      {icon}
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    'Terkirim': 'bg-slate-100 text-slate-600',
    'Dibaca': 'bg-blue-100 text-blue-600',
    'Diterima': 'bg-amber-100 text-amber-600',
    'Ditindaklanjuti': 'bg-emerald-100 text-emerald-600',
  };
  return (
    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tight ${colors[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
};

export default Dashboard;
