
import React, { useState } from 'react';
import { Bidang, User, UserRole, Laporan, LaporanStatus } from '../types';

interface AdminPanelProps {
  bidang: Bidang[];
  setBidang: React.Dispatch<React.SetStateAction<Bidang[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  currentUser: User;
  laporan: Laporan[];
}

const AdminPanel: React.FC<AdminPanelProps> = ({ bidang, setBidang, users, setUsers, currentUser, laporan }) => {
  const [activeTab, setActiveTab] = useState<'laporan' | 'pengawas' | 'bidang'>('pengawas');
  const [newBidang, setNewBidang] = useState('');
  
  // State for Export Filters
  const [exportFilters, setExportFilters] = useState({
    month: '', // YYYY-MM
    bidangId: 'all',
    status: 'all' as 'all' | LaporanStatus
  });

  // State for New User Form
  const [newUser, setNewUser] = useState({
    username: '',
    fullName: '',
    password: '',
    role: UserRole.SUPERVISOR,
    bidangId: ''
  });

  const handleGenerateCredentials = () => {
    if (!newUser.fullName.trim()) {
      alert("Masukkan Nama Lengkap terlebih dahulu untuk generate username.");
      return;
    }

    // Generate Username from Name (e.g., "Budi Santoso" -> "budi.santoso")
    const generatedUsername = newUser.fullName
      .toLowerCase()
      .trim()
      .split(' ')
      .map(part => part.replace(/[^a-z0-9]/g, ''))
      .filter(part => part.length > 0)
      .join('.')
      .substring(0, 15);

    // Generate Random 6-digit Password
    const generatedPassword = Math.random().toString(36).substring(2, 8).toUpperCase();

    setNewUser(prev => ({
      ...prev,
      username: generatedUsername,
      password: generatedPassword
    }));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username.trim() || !newUser.fullName.trim() || !newUser.password.trim()) return;
    
    if (users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase())) {
      alert("Username sudah digunakan. Silakan gunakan username lain.");
      return;
    }

    const userToAdd: User = {
      id: `u-${Date.now()}`,
      username: newUser.username.toLowerCase().trim(),
      fullName: newUser.fullName.trim(),
      password: newUser.password,
      role: newUser.role,
      bidangId: newUser.role === UserRole.BIDANG ? newUser.bidangId : undefined
    };

    setUsers(prev => [...prev, userToAdd]);
    alert(`Akun Berhasil Dibuat!\n\nNama: ${userToAdd.fullName}\nUser: ${userToAdd.username}\nPass: ${userToAdd.password}`);
    setNewUser({ username: '', fullName: '', password: '', role: UserRole.SUPERVISOR, bidangId: '' });
  };

  const handlePrintSlip = (user: User) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const html = `
      <html>
        <head>
          <title>Slip Akun E-Lapor</title>
          <style>
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .slip { border: 2px dashed #000; padding: 30px; width: 300px; text-align: center; }
            h2 { margin-top: 0; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
            .item { margin: 15px 0; text-align: left; }
            .label { font-size: 10px; font-weight: bold; color: #666; text-transform: uppercase; }
            .value { font-size: 16px; font-weight: bold; font-family: monospace; }
            .footer { font-size: 9px; color: #999; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="slip">
            <h2>AKUN E-LAPOR PENGAWAS</h2>
            <div class="item">
              <div class="label">Nama Lengkap</div>
              <div class="value">${user.fullName}</div>
            </div>
            <div class="item">
              <div class="label">Username</div>
              <div class="value">${user.username}</div>
            </div>
            <div class="item">
              <div class="label">Password</div>
              <div class="value">${user.password}</div>
            </div>
            <div class="footer">Simpan kredensial ini dengan aman.<br/>Dinas Pendidikan Kab/Kota</div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleRemoveUser = (id: string) => {
    if (id === currentUser.id) return alert("Tidak bisa menghapus diri sendiri.");
    if (confirm("Hapus pengguna ini?")) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleAddBidang = () => {
    if (!newBidang.trim()) return;
    setBidang(prev => [...prev, { id: `b-${Date.now()}`, nama: newBidang }]);
    setNewBidang('');
  };

  const handleRemoveBidang = (id: string) => {
    setBidang(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      <header className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Panel Kontrol Admin</h1>
          <p className="text-slate-500 font-medium">Manajemen data master, pengguna, dan rekapitulasi laporan.</p>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 w-fit">
        <button 
          onClick={() => setActiveTab('pengawas')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'pengawas' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Data Pengawas
        </button>
        <button 
          onClick={() => setActiveTab('laporan')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'laporan' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Rekap Laporan
        </button>
        <button 
          onClick={() => setActiveTab('bidang')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'bidang' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Master Bidang
        </button>
      </div>

      {activeTab === 'pengawas' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Create User */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-slate-100 sticky top-24">
              <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-6 flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                Input Data Pengawas
              </h2>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                  <input 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                    placeholder="Contoh: Dr. Budi, M.Pd"
                    value={newUser.fullName}
                    onChange={e => setNewUser({ ...newUser, fullName: e.target.value })}
                  />
                </div>
                
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-blue-700 uppercase">Kredensial Login</span>
                    <button 
                      type="button"
                      onClick={handleGenerateCredentials}
                      className="text-[9px] font-black bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      GENERATE ✨
                    </button>
                  </div>
                  <div className="space-y-2">
                    <input 
                      required
                      className="w-full px-3 py-2 rounded-lg border border-blue-100 bg-white outline-none font-mono text-xs font-bold"
                      placeholder="Username..."
                      value={newUser.username}
                      onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                    />
                    <input 
                      required
                      className="w-full px-3 py-2 rounded-lg border border-blue-100 bg-white outline-none font-mono text-xs font-bold"
                      placeholder="Password..."
                      value={newUser.password}
                      onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role & Penugasan</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 outline-none font-bold text-sm"
                    value={newUser.role}
                    onChange={e => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                  >
                    <option value={UserRole.SUPERVISOR}>Pengawas Sekolah</option>
                    <option value={UserRole.BIDANG}>Kepala Bidang</option>
                    <option value={UserRole.ADMIN}>Administrator Dinas</option>
                  </select>
                </div>

                {newUser.role === UserRole.BIDANG && (
                  <select 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/30 outline-none font-bold text-sm"
                    value={newUser.bidangId}
                    onChange={e => setNewUser({ ...newUser, bidangId: e.target.value })}
                  >
                    <option value="">-- Pilih Bidang Penugasan --</option>
                    {bidang.map(b => <option key={b.id} value={b.id}>{b.nama}</option>)}
                  </select>
                )}

                <button className="w-full bg-slate-900 text-white font-black py-4 rounded-xl hover:bg-blue-600 transition-all shadow-xl active:scale-95 text-xs uppercase tracking-widest">
                  Simpan & Daftar
                </button>
              </form>
            </div>
          </div>

          {/* List Users */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daftar Akun Pengguna</h2>
                <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500">{users.length} TOTAL</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-[9px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50">
                    <tr>
                      <th className="px-6 py-4">Nama Lengkap</th>
                      <th className="px-6 py-4">User & Pass</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800 text-sm">{u.fullName}</p>
                          <p className="text-[10px] text-slate-400">{u.role}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-mono font-bold text-blue-600">@{u.username}</span>
                            <span className="text-[10px] font-mono text-slate-400">{u.password}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${u.role === UserRole.SUPERVISOR ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                            {u.role === UserRole.BIDANG ? (bidang.find(b => b.id === u.bidangId)?.nama || 'BIDANG') : u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button 
                            onClick={() => handlePrintSlip(u)}
                            className="text-slate-400 hover:text-blue-600 p-1"
                            title="Cetak Slip Login"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                          </button>
                          {u.id !== currentUser.id && (
                            <button 
                              onClick={() => handleRemoveUser(u.id)}
                              className="text-slate-300 hover:text-red-500 p-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'laporan' && (
        <section className="bg-white rounded-[2.5rem] shadow-xl p-8 md:p-10 border border-slate-100 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              Export Rekap Laporan & Tanggapan
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Periode Bulan</label>
              <input 
                type="month"
                className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold shadow-sm"
                value={exportFilters.month}
                onChange={e => setExportFilters({ ...exportFilters, month: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bidang</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold shadow-sm"
                value={exportFilters.bidangId}
                onChange={e => setExportFilters({ ...exportFilters, bidangId: e.target.value })}
              >
                <option value="all">Semua Bidang</option>
                {bidang.map(b => <option key={b.id} value={b.id}>{b.nama}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold shadow-sm"
                value={exportFilters.status}
                onChange={e => setExportFilters({ ...exportFilters, status: e.target.value as any })}
              >
                <option value="all">Semua Status</option>
                <option value="Terkirim">Terkirim</option>
                <option value="Dibaca">Dibaca</option>
                <option value="Diterima">Diterima</option>
                <option value="Ditindaklanjuti">Ditindaklanjuti</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => alert("Fitur Excel (CSV) diaktifkan")}
                className="flex-grow bg-emerald-600 text-white font-black py-3 rounded-xl hover:bg-emerald-700 transition-all shadow-lg text-[10px] uppercase tracking-widest"
              >
                CSV
              </button>
              <button 
                onClick={() => window.print()}
                className="flex-grow bg-slate-900 text-white font-black py-3 rounded-xl hover:bg-blue-600 transition-all shadow-lg text-[10px] uppercase tracking-widest"
              >
                Cetak PDF
              </button>
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-50 text-center">
            <p className="text-xs text-slate-400 font-medium italic">Gunakan filter di atas untuk menyesuaikan data yang akan diekspor.</p>
          </div>
        </section>
      )}

      {activeTab === 'bidang' && (
        <div className="bg-white rounded-[2.5rem] shadow-xl p-10 border border-slate-100">
           <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-8 flex items-center">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
            Manajemen Master Bidang
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tambah Bidang Baru</label>
                <div className="flex gap-2">
                  <input 
                    className="flex-grow px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold"
                    placeholder="Nama Bidang..."
                    value={newBidang}
                    onChange={e => setNewBidang(e.target.value)}
                  />
                  <button 
                    onClick={handleAddBidang} 
                    className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Bidang Terdaftar</label>
              <div className="grid grid-cols-1 gap-3">
                {bidang.map(b => (
                  <div key={b.id} className="group p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-transparent hover:border-slate-200 transition-all">
                    <span className="font-bold text-slate-700 text-sm">{b.nama}</span>
                    <button 
                      onClick={() => handleRemoveBidang(b.id)} 
                      className="text-red-300 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
