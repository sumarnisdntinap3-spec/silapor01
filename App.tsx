
import React, { useState, useEffect } from 'react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, UserRole, Laporan, Bidang } from './types';
import { safeStorage } from './storage';
import Login from './components/Auth';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ReportForm from './components/ReportForm';
import ReportDetail from './components/ReportDetail';
import AdminPanel from './components/AdminPanel';

const DEFAULT_BIDANG: Bidang[] = [
  { id: 'b1', nama: 'Bidang Dikdas' },
  { id: 'b3', nama: 'Bidang PTK (Pendidik & Tenaga Kependidikan)' },
  { id: 'b4', nama: 'Bidang PAUD dan PNF' },
  { id: 'b5', nama: 'Bidang Umum dan Kesekretariatan' },
];

const INITIAL_USERS: User[] = [
  { id: 'u1', username: 'admin', fullName: 'Administrator Dinas', role: UserRole.ADMIN, password: '123' },
  { id: 'u2', username: 'pengawas1', fullName: 'Budi Santoso, M.Pd', role: UserRole.SUPERVISOR, password: '123' },
  { id: 'u3', username: 'kabid_dikdas', fullName: 'Irawan, M.Pd (Kabid Dikdas)', role: UserRole.BIDANG, bidangId: 'b1', password: '123' },
  { id: 'u4', username: 'kabid_ptk', fullName: 'Diantina Wiwied Pribadi, S.Sos, M.Si (Kabid PTK)', role: UserRole.BIDANG, bidangId: 'b3', password: '123' },
  { id: 'u5', username: 'ary', fullName: 'ARY WAHYU K', role: UserRole.SUPERVISOR, password: '321' },
  { id: 'u6', username: 'kabid_paud', fullName: 'Hj. Ratna Sari (Kabid PAUD PNF)', role: UserRole.BIDANG, bidangId: 'b4', password: '123' },
  { id: 'u7', username: 'darwati', fullName: 'Darwati', role: UserRole.SUPERVISOR, password: '234' },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = safeStorage.getItem('currentUser');
    try { return saved ? JSON.parse(saved) : null; } catch { return null; }
  });

  const [bidangList, setBidangList] = useState<Bidang[]>(() => {
    const saved = safeStorage.getItem('bidang');
    try { return saved ? JSON.parse(saved) : DEFAULT_BIDANG; } catch { return DEFAULT_BIDANG; }
  });

  const [userList, setUserList] = useState<User[]>(() => {
    const saved = safeStorage.getItem('users');
    try { return saved ? JSON.parse(saved) : INITIAL_USERS; } catch { return INITIAL_USERS; }
  });

  const [laporanList, setLaporanList] = useState<Laporan[]>(() => {
    const saved = safeStorage.getItem('laporan');
    try { return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  useEffect(() => {
    if (currentUser) {
      safeStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      safeStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    safeStorage.setItem('bidang', JSON.stringify(bidangList));
  }, [bidangList]);

  useEffect(() => {
    safeStorage.setItem('users', JSON.stringify(userList));
  }, [userList]);

  useEffect(() => {
    safeStorage.setItem('laporan', JSON.stringify(laporanList));
  }, [laporanList]);

  const addLaporan = (newLap: Laporan) => {
    setLaporanList(prev => [newLap, ...prev]);
  };

  const updateLaporan = (updatedLap: Laporan) => {
    setLaporanList(prev => prev.map(l => l.id === updatedLap.id ? updatedLap : l));
  };

  const deleteLaporan = (id: string) => {
    setLaporanList(prev => prev.filter(l => l.id !== id));
  };

  return (
    <MemoryRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-blue-100">
        {currentUser && <Navbar user={currentUser} onLogout={() => setCurrentUser(null)} />}
        
        <main className="flex-grow container mx-auto px-4 py-6 max-w-7xl">
          <Routes>
            <Route path="/login" element={!currentUser ? <Login users={userList} onLogin={setCurrentUser} /> : <Navigate to="/" />} />
            
            <Route path="/" element={
              currentUser ? (
                <Dashboard user={currentUser} laporan={laporanList} bidang={bidangList} />
              ) : <Navigate to="/login" />
            } />

            <Route path="/admin" element={
              currentUser?.role === UserRole.ADMIN ? (
                <AdminPanel 
                  bidang={bidangList} 
                  setBidang={setBidangList} 
                  users={userList}
                  setUsers={setUserList}
                  currentUser={currentUser}
                  laporan={laporanList}
                />
              ) : <Navigate to="/" />
            } />

            <Route path="/laporan/baru" element={
              currentUser?.role === UserRole.SUPERVISOR ? (
                <ReportForm user={currentUser} bidang={bidangList} onSave={addLaporan} />
              ) : <Navigate to="/" />
            } />

            <Route path="/laporan/:id" element={
              currentUser ? (
                <ReportDetail user={currentUser} laporan={laporanList} bidang={bidangList} onUpdate={updateLaporan} onDelete={deleteLaporan} />
              ) : <Navigate to="/login" />
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-slate-200 py-6 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} E-Lapor Dinas Pendidikan. Terintegrasi Gemini AI.</p>
        </footer>
      </div>
    </MemoryRouter>
  );
};

export default App;
