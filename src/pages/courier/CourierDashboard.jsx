import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getProfileAPI } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { Truck, Clock, CheckCircle2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

function StatusCard({ status }) {
  const config = {
    pending: {
      icon: Clock,
      color: 'bg-yellow-50 border-yellow-200',
      iconColor: 'text-yellow-500',
      title: 'Verifikasi Pending',
      desc: 'Akun Anda sedang menunggu verifikasi dari admin. Proses ini biasanya memakan waktu 1-2 hari kerja.',
      badge: 'badge-pending',
    },
    approved: {
      icon: CheckCircle2,
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-green-500',
      title: 'Akun Terverifikasi',
      desc: 'Selamat! Akun Anda telah diverifikasi. Anda dapat mulai menerima dan mengelola tugas pengiriman.',
      badge: 'badge-approved',
    },
    rejected: {
      icon: XCircle,
      color: 'bg-red-50 border-red-200',
      iconColor: 'text-red-500',
      title: 'Verifikasi Ditolak',
      desc: 'Maaf, verifikasi akun Anda ditolak. Silakan hubungi admin untuk informasi lebih lanjut.',
      badge: 'badge-rejected',
    },
  };

  const cfg = config[status] || config.pending;
  const Icon = cfg.icon;

  return (
    <div className={`card border-2 ${cfg.color} flex items-start gap-4 animate-fade-in`}>
      <div className={`w-14 h-14 rounded-2xl ${cfg.color} flex items-center justify-center flex-shrink-0`}>
        <Icon size={28} className={cfg.iconColor} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-bold text-dark-700 text-lg">{cfg.title}</h3>
          <span className={cfg.badge}>{status}</span>
        </div>
        <p className="text-dark-500 text-sm leading-relaxed">{cfg.desc}</p>
      </div>
    </div>
  );
}

export default function CourierDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    
    try {
      const res = await getProfileAPI();
      setProfile(res.data);
      if (isManual) toast.success('Status diperbarui');
    } catch {
      toast.error('Gagal memuat profil');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const courierStatus = profile?.courier_profile?.status || 'pending';

  return (
    <DashboardLayout title={`Halo, ${user?.name || 'Kurir'}! 🚴`} subtitle="Dashboard kurir KIK Laundry">
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => fetchProfile(true)} 
          disabled={refreshing}
          className="btn-ghost text-sm flex items-center gap-2"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh Status
        </button>
      </div>

      {loading ? (
        <div className="card h-32 bg-gray-100 animate-pulse" />
      ) : (
        <div className="space-y-6">
          <StatusCard status={courierStatus} />

          {/* Info card */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Truck size={20} className="text-blue-600" />
                </div>
                <h3 className="font-bold text-dark-700">Info Akun</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-400">Nama</span>
                  <span className="font-medium text-dark-700">{user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Email</span>
                  <span className="font-medium text-dark-700">{user?.email || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">HP</span>
                  <span className="font-medium text-dark-700">{user?.phone || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Role</span>
                  <span className="badge badge-active capitalize">{user?.role}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle size={20} className="text-yellow-600" />
                </div>
                <h3 className="font-bold text-dark-700">Panduan Kurir</h3>
              </div>
              <ol className="space-y-2 text-sm text-dark-500 list-decimal list-inside">
                <li>Ambil pesanan yang tersedia</li>
                <li>Pickup pakaian dari pelanggan</li>
                <li>Timbang pakaian & input berat</li>
                <li>Antar ke toko laundry</li>
                <li>Setelah laundry selesai, antar balik ke pelanggan</li>
              </ol>
            </div>
          </div>

          {courierStatus === 'approved' && (
            <div className="card bg-gradient-to-r from-blue-600 to-blue-700 text-white animate-slide-up">
              <h3 className="font-bold text-lg mb-1">Siap Bertugas! 🚀</h3>
              <p className="text-blue-100 text-sm">Akun Anda telah aktif. Silakan buka halaman Tugas Pengiriman untuk mulai bekerja.</p>
              <a href="/courier/tasks" className="mt-4 inline-block bg-white text-blue-600 px-5 py-2 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors">
                Lihat Tugas Pengiriman →
              </a>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
