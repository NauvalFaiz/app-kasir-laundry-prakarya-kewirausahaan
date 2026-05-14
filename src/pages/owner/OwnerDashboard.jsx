import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { ownerDashboardAPI, ownerOrdersAPI } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { Package, DollarSign, Activity, TrendingUp, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

  const recentOrders = orders.slice(0, 10);
  
  // Calculate monthly sales data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthlyDataMap = {};

  orders.forEach(order => {
    if (order.status !== 'cancel' && order.payment_status === 'paid') {
      const dateStr = order.created_at || order.createdAt; 
      if (dateStr) {
        const date = new Date(dateStr);
        const monthYear = `${months[date.getMonth()]} ${date.getFullYear()}`;
        
        if (!monthlyDataMap[monthYear]) {
          monthlyDataMap[monthYear] = { time: monthYear, sales: 0, dateValue: new Date(date.getFullYear(), date.getMonth(), 1) };
        }
        monthlyDataMap[monthYear].sales += Number(order.total_price || 0);
      }
    }
  });

  const monthlyData = Object.values(monthlyDataMap).sort((a, b) => a.dateValue - b.dateValue);
  if (monthlyData.length === 0) {
    const now = new Date();
    monthlyData.push({ time: `${months[now.getMonth()]} ${now.getFullYear()}`, sales: 0 });
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 rounded-lg shadow-lg text-sm">
          <p className="font-bold text-dark-700">{label}</p>
          <p className="text-primary font-bold">
            Rp {payload[0].value.toLocaleString('id-ID')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout title={`Selamat datang, ${user?.laundry_name || 'Owner'}! `} subtitle="Berikut ringkasan toko laundry Anda hari ini.">

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
            color="bg-primary"
            sub="dari pesanan lunas"
          />
          <StatCard
            icon={Activity}
            label="Pesanan Aktif"
            value={stats?.active_orders ?? 0}
            color="bg-primary"
            sub="sedang diproses"
          />
        </div>
      )}

      {/* Grafik Penjualan Bulanan */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-dark-700 text-lg">Riwayat Penjualan <span className="text-sm font-normal text-dark-400 ml-1">(Per Bulan)</span></h3>
        </div>
        {loadingStats ? (
          <div className="h-[300px] bg-gray-100 rounded-xl animate-pulse w-full"></div>
        ) : (
          <div className="h-[300px] w-full ml-[-15px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="time" 
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickFormatter={(value) => value.toLocaleString('id-ID')}
                  width={90}
                />
                <Tooltip cursor={{ fill: '#f3f4f6' }} content={<CustomTooltip />} />
                <Bar dataKey="sales" fill="#3f72af" maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Status Flow Overview */}
      <div className="card mb-8">
        <h3 className="font-bold text-dark-700 mb-6">Distribusi Status Pesanan</h3>
        {loadingStats ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (() => {
          const statusLabels = {
            pending: { label: 'Pending', icon: '⏳', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
            pickup: { label: 'Pickup', icon: '🛵', color: 'bg-orange-50 text-orange-700 border-orange-200' },
            to_laundry: { label: 'Ke Toko', icon: '📦', color: 'bg-blue-50 text-blue-700 border-blue-200' },
            received: { label: 'Diterima', icon: '✅', color: 'bg-teal-50 text-teal-700 border-teal-200' },
            process: { label: 'Proses', icon: '🧺', color: 'bg-purple-50 text-purple-700 border-purple-200' },
            done: { label: 'Selesai Cuci', icon: '✨', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            delivery_back: { label: 'Antar Balik', icon: '🚚', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
            completed: { label: 'Completed', icon: '🏁', color: 'bg-green-50 text-green-700 border-green-200' },
          };
          const counts = {};
          orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
          return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(statusLabels).map(([key, { label, icon, color }]) => (
                <div key={key} className={`rounded-xl border p-3 text-center ${color} transition-all hover:scale-[1.02]`}>
                  <div className="text-xl mb-1">{icon}</div>
                  <div className="text-2xl font-black">{counts[key] || 0}</div>
                  <div className="text-xs font-semibold mt-0.5 opacity-80">{label}</div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

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
