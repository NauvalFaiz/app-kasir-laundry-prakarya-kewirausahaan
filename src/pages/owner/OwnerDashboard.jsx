import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { ownerDashboardAPI, ownerOrdersAPI } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { Package, DollarSign, Activity, TrendingUp, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'badge-pending',
  pickup: 'badge-pickup',
  weighing: 'badge-process',
  to_laundry: 'badge-process',
  received: 'badge-active',
  process: 'badge-process',
  done: 'badge-done',
  delivery_back: 'badge-pickup',
  shipped: 'badge-active',
  completed: 'badge-completed',
  paid: 'badge-paid',
  cancel: 'bg-gray-100 text-gray-600 badge',
};

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-dark-400 font-medium">{label}</p>
          <p className="text-3xl font-bold text-dark-700 mt-1">{value}</p>
          {sub && <p className="text-xs text-dark-300 mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </div>
  );
}

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchData = async () => {
    setLoadingStats(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([ownerDashboardAPI(), ownerOrdersAPI()]);
      setStats(statsRes.data.data);
      setOrders(ordersRes.data || []);
    } catch {
      toast.error('Gagal memuat data dashboard');
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const recentOrders = orders.slice(0, 5);

  return (
    <DashboardLayout title={`Selamat datang, ${user?.name || 'Owner'}! 👋`} subtitle="Berikut ringkasan toko laundry Anda hari ini.">

      {/* Refresh */}
      <div className="flex justify-end mb-4">
        <button onClick={fetchData} className="btn-ghost text-sm flex items-center gap-1.5">
          <RefreshCw size={14} className={loadingStats ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      {loadingStats ? (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-28 bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={Package}
            label="Total Pesanan"
            value={stats?.total_orders ?? 0}
            color="bg-primary"
          />
          <StatCard
            icon={DollarSign}
            label="Total Pendapatan"
            value={`Rp ${(stats?.total_revenue ?? 0).toLocaleString('id-ID')}`}
            color="bg-dark"
            sub="dari pesanan lunas"
          />
          <StatCard
            icon={Activity}
            label="Pesanan Aktif"
            value={stats?.active_orders ?? 0}
            color="bg-blue-600"
            sub="sedang diproses"
          />
        </div>
      )}

      {/* Recent Orders */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-dark-700">Pesanan Terbaru</h3>
          <a href="/owner/orders" className="text-primary text-sm font-medium hover:underline">Lihat semua →</a>
        </div>

        {recentOrders.length === 0 && !loadingStats ? (
          <div className="text-center py-10 text-dark-300">
            <Package size={40} className="mx-auto mb-3 opacity-40" />
            <p>Belum ada pesanan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-3 text-dark-400 font-medium">ID</th>
                  <th className="text-left pb-3 text-dark-400 font-medium">Lokasi</th>
                  <th className="text-left pb-3 text-dark-400 font-medium">Metode Bayar</th>
                  <th className="text-left pb-3 text-dark-400 font-medium">Total</th>
                  <th className="text-left pb-3 text-dark-400 font-medium">Status</th>
                  <th className="text-left pb-3 text-dark-400 font-medium">Pembayaran</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-mono text-xs text-dark-500">#{order.id}</td>
                    <td className="py-3 text-dark-600 max-w-[140px] truncate">{order.laundry_location}</td>
                    <td className="py-3">
                      <span className={`badge ${order.payment_method === 'qris' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                        {order.payment_method?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-dark-700">Rp {Number(order.total_price).toLocaleString('id-ID')}</td>
                    <td className="py-3">
                      <span className={statusColors[order.status] || 'badge bg-gray-100 text-gray-600'}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={order.payment_status === 'paid' ? 'badge-paid' : 'badge-unpaid'}>
                        {order.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
