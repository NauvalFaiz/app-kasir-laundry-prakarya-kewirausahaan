import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getLaundriesAPI, approveOwnerAPI } from '../../api/endpoints';
import toast from 'react-hot-toast';
import { ShoppingBag, RefreshCw, CheckCircle, Search } from 'lucide-react';

export default function AdminLaundries() {
  const [laundries, setLaundries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [approving, setApproving] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await getLaundriesAPI();
      setLaundries(res.data.data || []);
    } catch {
      toast.error('Gagal memuat data laundry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleApprove = async (id) => {
    setApproving(id);
    try {
      await approveOwnerAPI(id);
      toast.success('Owner berhasil disetujui!');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyetujui');
    } finally {
      setApproving(null);
    }
  };

  const filtered = laundries.filter(
    (l) =>
      l.laundry_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase())
  );

  const statusCounts = {
    total: laundries.length,
    active: laundries.filter((l) => l.status === 'active').length,
    inactive: laundries.filter((l) => l.status !== 'active').length,
  };

  return (
    <DashboardLayout title="Manajemen Laundry & Owner" subtitle="Verifikasi dan kelola semua toko laundry yang terdaftar.">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Laundry', value: statusCounts.total, color: 'bg-dark/10 text-dark' },
          { label: 'Aktif', value: statusCounts.active, color: 'bg-green-100 text-green-700' },
          { label: 'Menunggu', value: statusCounts.inactive, color: 'bg-yellow-100 text-yellow-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center">
            <span className={`text-3xl font-black ${color.split(' ')[1]}`}>{value}</span>
            <p className="text-xs text-dark-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
          <input
            className="input pl-9"
            placeholder="Cari nama toko / owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button onClick={fetch} className="btn-ghost flex items-center gap-1.5 text-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="card h-24 bg-gray-100 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-14">
          <ShoppingBag size={44} className="mx-auto mb-3 text-gray-300" />
          <p className="text-dark-400">Tidak ada laundry ditemukan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((laundry) => (
            <div key={laundry.id} className="card animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-lg">
                    {laundry.laundry_name?.[0]?.toUpperCase() || 'L'}
                  </div>
                  <div>
                    <h4 className="font-bold text-dark-700">{laundry.laundry_name}</h4>
                    <p className="text-sm text-dark-400">Owner: {laundry.name}</p>
                    <p className="text-xs text-dark-300">{laundry.email} · {laundry.phone || '-'}</p>
                    <p className="text-xs text-dark-300 mt-0.5">📍 {laundry.laundry_address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`badge ${laundry.status === 'active' ? 'badge-approved' : 'badge-pending'}`}>
                    {laundry.status === 'active' ? '✓ Aktif' : '⏳ Pending'}
                  </span>
                  {laundry.status !== 'active' && (
                    <button
                      onClick={() => handleApprove(laundry.id)}
                      disabled={approving === laundry.id}
                      className="btn-primary btn-sm flex items-center gap-1.5"
                    >
                      {approving === laundry.id ? (
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <><CheckCircle size={14} /> Setujui</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
