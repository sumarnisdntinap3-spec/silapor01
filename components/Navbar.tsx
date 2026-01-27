
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 text-white shadow-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-xl font-black tracking-tighter flex items-center">
            <span className="bg-blue-600 px-2 py-1 rounded mr-2">E</span> LAPOR
          </Link>
          <div className="hidden md:flex space-x-6 text-sm font-bold uppercase tracking-wider">
            <Link to="/" className="hover:text-blue-400 transition">Beranda</Link>
            {user.role === UserRole.SUPERVISOR && (
              <Link to="/laporan/baru" className="hover:text-blue-400 transition">Input Laporan</Link>
            )}
            {user.role === UserRole.ADMIN && (
              <Link to="/admin" className="hover:text-blue-400 transition">Panel Admin</Link>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-blue-400 uppercase leading-none mb-1">
              {user.role === UserRole.ADMIN ? 'Admin Dinas' : user.role === UserRole.BIDANG ? 'Kepala Bidang' : 'Pengawas'}
            </p>
            <p className="text-sm font-bold">{user.fullName}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all border border-red-600/30"
          >
            LOGOUT
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
