import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, ShoppingBag, Truck, ClipboardList,
  Settings2, UserCircle, LogOut, WashingMachine
} from 'lucide-react';

export default function DashboardSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menu = {
    owner: [
      { to: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/owner/pos', label: 'Kasir POS', icon: ShoppingBag },
      { to: '/owner/orders', label: 'Daftar Pesanan', icon: ClipboardList },
      { to: '/owner/services', label: 'Layanan Laundry', icon: Settings2 },
      { to: '/owner/profile', label: 'Profil Saya', icon: UserCircle },
    ],
    admin: [
      { to: '/admin/laundries', label: 'Laundry & Owner', icon: ShoppingBag },
      { to: '/admin/couriers', label: 'Manajemen Kurir', icon: Truck },
      { to: '/admin/orders', label: 'Monitor Pesanan', icon: ClipboardList },
      { to: '/admin/profile', label: 'Profil Admin', icon: UserCircle },
    ],
    kurir: [
      { to: '/courier/dashboard', label: 'Status Akun', icon: LayoutDashboard },
      { to: '/courier/tasks', label: 'Tugas Pengiriman', icon: Truck },
      { to: '/courier/profile', label: 'Profil Saya', icon: UserCircle },
    ],
  };

  const currentMenu = menu[user?.role] || [];

  return (
    <div className="w-64 bg-white border-r border-gray-100 flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-50">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
            <WashingMachine size={18} className="text-white" />
          </div>
          <span className="font-bold text-dark-700 tracking-tight">
            {user?.role === 'owner' ? (user?.owner_profile?.laundry_name || user?.laundry_name || 'KIK Laundry') : 'KIK Laundry'}
          </span>
        </Link>
      </div>

      {/* Menu Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {currentMenu.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-50">
        <div className="bg-gray-50 rounded-2xl p-4 mb-4">
          <p className="text-xs text-dark-400 mb-1">Login sebagai:</p>
          <p className="text-sm font-bold text-dark-700 truncate">{user?.name}</p>
          <p className="text-[10px] uppercase tracking-wider text-primary font-bold mt-0.5">{user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut size={18} />
          Keluar Sistem
        </button>
      </div>
    </div>
  );
}
