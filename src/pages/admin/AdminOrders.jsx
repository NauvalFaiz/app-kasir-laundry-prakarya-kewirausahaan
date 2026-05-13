import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { adminOrdersAPI, adminUpdateOrderAPI } from '../../api/endpoints';
import toast from 'react-hot-toast';
import { ClipboardList, RefreshCw, Search, ChevronDown } from 'lucide-react';

const STATUS_OPTIONS = ['pending','pickup','weighing','to_laundry','received','process','done','delivery_back','shipped','completed','cancel'];

const STATUS_BADGES = {
  pending: 'badge-pending', pickup: 'badge-pickup', weighing: 'badge-process',
  to_laundry: 'badge-process', received: 'badge-active', process: 'badge-process',
  done: 'badge-done', delivery_back: 'badge-pickup', shipped: 'badge-active',
  completed: 'badge-completed', paid: 'badge-paid', cancel: 'badge bg-gray-100 text-gray-600',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await adminOrdersAPI();
      setOrders(res.data.data || []);
    } catch {
      toast.error('Gagal memuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdating(id);
    try {
      await adminUpdateOrderAPI(id, { status: newStatus });
      toast.success('Status berhasil diperbarui');
      fetch();
    } catch {
      toast.error('Gagal update status');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = orders.filter(
    (o) =>
      String(o.id).includes(search) ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.owner?.laundry_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Monitor Semua Pesanan" subtitle="Pantau dan kelola semua pesanan dalam sistem.">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
          <input
            className="input pl-9"
            placeholder="Cari ID, customer, laundry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button onClick={fetch} className="btn-ghost flex items-center gap-1.5 text-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
        <span className="text-sm text-dark-400">{filtered.length} pesanan</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="card h-20 bg-gray-100 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-14">
          <ClipboardList size={44} className="mx-auto mb-3 text-gray-300" />
          <p className="text-dark-400">Tidak ada pesanan ditemukan</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-dark-400 font-semibold">ID</th>
                  <th className="text-left px-5 py-3 text-dark-400 font-semibold">Customer</th>
                  <th className="text-left px-5 py-3 text-dark-400 font-semibold">Laundry</th>
                  <th className="text-left px-5 py-3 text-dark-400 font-semibold">Total</th>
                  <th className="text-left px-5 py-3 text-dark-400 font-semibold">Bayar</th>
                  <th className="text-left px-5 py-3 text-dark-400 font-semibold">Status</th>
                  <th className="text-left px-5 py-3 text-dark-400 font-semibold">Ubah Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-dark-500">#{order.id}</td>
                    <td className="px-5 py-3 text-dark-700">{order.user?.name || '-'}</td>
                    <td className="px-5 py-3 text-dark-600">{order.owner?.laundry_name || '-'}</td>
                    <td className="px-5 py-3 font-semibold">Rp {Number(order.total_price).toLocaleString('id-ID')}</td>
                    <td className="px-5 py-3">
                      <span className={order.payment_status === 'paid' ? 'badge-paid' : 'badge-unpaid'}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={STATUS_BADGES[order.status] || 'badge bg-gray-100 text-gray-600'}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="relative">
                        <select
                          value={order.status}
                          disabled={updating === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="input py-1 pr-8 text-xs w-36 appearance-none"
                        >
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dark-300 pointer-events-none" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
