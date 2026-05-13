import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logoutAPI } from '../api/endpoints';
import toast from 'react-hot-toast';
import {
  WashingMachine, Menu, X, LogOut, LayoutDashboard, LogIn
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutAPI();
    } catch (_) {}
    logout();
    toast.success('Berhasil logout');
    navigate('/');
  };

  const dashboardLink = () => {
    if (!user) return '/login';
    const map = { owner: '/owner/dashboard', admin: '/admin/laundries', kurir: '/courier/dashboard' };
    return map[user.role] || '/';
  };

  const isLanding = location.pathname === '/';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <WashingMachine size={20} className="text-white" />
            </div>
            <span className="font-bold text-lg text-dark-700">
              {user?.role === 'owner' ? (
                <>
                  {user?.owner_profile?.laundry_name || user?.laundry_name || 'KIK Laundry'}
                </>
              ) : (
                <>
                  KIK<span className="text-primary">Laundry</span>
                </>
              )}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {isLanding && (
              <>
                <a href="#features" className="btn-ghost text-sm">Fitur</a>
                <a href="#about" className="btn-ghost text-sm">Tentang</a>
              </>
            )}

            {isAuthenticated ? (
              <>
                <Link to={dashboardLink()} className="btn-ghost text-sm flex items-center gap-1.5">
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
                  <span className="text-xs text-dark-400 font-medium">
                    {user?.name} · <span className="text-primary capitalize">{user?.role}</span>
                  </span>
                  <button onClick={handleLogout} className="btn-ghost text-sm flex items-center gap-1.5 text-red-500 hover:bg-red-50">
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm flex items-center gap-1.5">
                  <LogIn size={15} />
                  Login
                </Link>
                <Link to="/register/owner" className="btn-primary text-sm shadow-md shadow-primary/20">
                  Daftar Sekarang
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 animate-fade-in space-y-1">
          {isLanding && (
            <>
              <a href="#features" className="block py-2 px-3 text-sm text-dark-600 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>Fitur</a>
              <a href="#about" className="block py-2 px-3 text-sm text-dark-600 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>Tentang</a>
            </>
          )}
          {isAuthenticated ? (
            <>
              <Link to={dashboardLink()} className="block py-2 px-3 text-sm text-dark-600 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="w-full text-left py-2 px-3 text-sm text-red-500 hover:bg-red-50 rounded-lg">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block py-2 px-3 text-sm text-dark-600 hover:bg-gray-50 rounded-lg font-semibold" onClick={() => setMenuOpen(false)}>Login Sistem</Link>
              <div className="border-t border-gray-100 pt-2 mt-2">
                <Link to="/register/owner" className="block py-2 px-3 text-sm text-primary font-semibold hover:bg-primary/5 rounded-lg" onClick={() => setMenuOpen(false)}>Daftar Owner</Link>
                <Link to="/register/courier" className="block py-2 px-3 text-sm text-blue-600 font-semibold hover:bg-blue-50 rounded-lg" onClick={() => setMenuOpen(false)}>Daftar Kurir</Link>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
