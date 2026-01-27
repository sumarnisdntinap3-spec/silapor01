
import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (user) {
        if (user.password === password) {
          onLogin(user);
        } else {
          alert("Kata sandi salah.");
        }
      } else {
        alert("Username tidak ditemukan. Pastikan Admin sudah mendaftarkan akun Anda.");
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-12 text-center text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-[80px] opacity-30"></div>
          <h2 className="text-4xl font-black tracking-tighter mb-4 relative z-10">E-LAPOR</h2>
          <div className="relative z-10 space-y-1">
            <p className="text-slate-400 font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] leading-tight">
              Dinas Pendidikan, Kepemudaan
            </p>
            <p className="text-slate-400 font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] leading-tight">
              dan Olahraga
            </p>
            <p className="text-blue-500 font-black text-[11px] md:text-xs uppercase tracking-[0.25em] mt-3">
              Kabupaten Magetan
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="p-10 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username Akses</label>
            <input 
              required
              className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold text-slate-800"
              placeholder="Masukkan username anda..."
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kata Sandi</label>
            <input 
              required
              type="password"
              className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold text-slate-800"
              placeholder="Masukkan kata sandi..."
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-600 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'MENYAMBUNGKAN...' : 'MASUK KE DASHBOARD'}
          </button>

          <div className="mt-8 pt-8 border-t border-slate-50">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center mb-4">Bantuan Login</p>
            <div className="text-[11px] text-slate-400 text-center leading-relaxed font-medium">
              <p>Gunakan username dan kata sandi yang telah didaftarkan oleh Admin Dinas.</p>
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p>Contoh Pengawas:</p>
                <p className="font-bold text-slate-700">User: <span className="text-blue-600">darwati</span> | Pass: <span className="text-blue-600">234</span></p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
