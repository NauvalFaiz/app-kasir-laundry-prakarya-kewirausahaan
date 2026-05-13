import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getAllCouriersAPI, approveCourierAPI, activeCouriersAPI } from '../../api/endpoints';
import toast from 'react-hot-toast';
import { Truck, RefreshCw, CheckCircle, MapPin, Search, UserCheck } from 'lucide-react';

const taskStatusBadge = {
  assigned: 'badge-pending',
  picked_up: 'badge-pickup',
  delivering: 'badge-process',
  completed: 'badge-completed',
};

export default function AdminCouriers() {
  const [couriers, setCouriers] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('verification'); // 'verification' | 'active'
  const [approving, setApproving] = useState(null);
  const [search, setSearch] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [couriersRes, activeRes] = await Promise.all([
        getAllCouriersAPI(),
        activeCouriersAPI()
      ]);
      setCouriers(couriersRes.data.data || []);
      setActiveTasks(activeRes.data.data || []);
    } catch {
      toast.error('Gagal memuat data kurir');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleApprove = async (userId) => {
    setApproving(userId);
    try {
      await approveCourierAPI(userId);
      toast.success('Kurir berhasil disetujui!');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyetujui');
    } finally {
      setApproving(null);
    }
  };

  const filteredCouriers = couriers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Manajemen Kurir" subtitle="Verifikasi pendaftaran kurir baru dan pantau aktivitas mereka.">
      {/* Tabs */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-6 bg-white w-fit">
        <button
          onClick={() => setTab('verification')}
          className={`px-6 py-2.5 text-sm font-semibold transition-all ${
            tab === 'verification' ? 'bg-primary text-white' : 'text-dark-400 hover:bg-gray-50'
          }`}
        >
          Verifikasi Registrasi
        </button>
        <button
          onClick={() => setTab('active')}
          className={`px-6 py-2.5 text-sm font-semibold transition-all ${
            tab === 'active' ? 'bg-primary text-white' : 'text-dark-400 hover:bg-gray-50'
          }`}
        >
          Monitor Kurir Aktif
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        {tab === 'verification' && (
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
            <input
              className="input pl-9"
              placeholder="Cari nama/email kurir..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}
        <button onClick={fetchAll} className="btn-ghost flex items-center gap-1.5 text-sm ml-auto">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card h-24 bg-gray-100 animate-pulse" />)}</div>
      ) : tab === 'verification' ? (
        /* --- VERIFICATION TAB --- */
        <div className="space-y-3">
          {filteredCouriers.length === 0 ? (
            <div className="card text-center py-14">
              <UserCheck size={44} className="mx-auto mb-3 text-gray-300" />
              <p className="text-dark-400">Tidak ada kurir ditemukan</p>
            </div>
          ) : (
            filteredCouriers.map((courier) => (
              <div key={courier.id} className="card animate-fade-in">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg">
                      {courier.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-dark-700">{courier.name}</h4>
                      <p className="text-sm text-dark-400">{courier.email} · {courier.phone || '-'}</p>
                      <div className="flex gap-2 mt-1">
                        <span className={`badge ${courier.courier_profile?.status === 'approved' ? 'badge-approved' : 'badge-pending'}`}>
                          {courier.courier_profile?.status === 'approved' ? 'Terverifikasi' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {courier.courier_profile?.status !== 'approved' && (
                      <button
                        onClick={() => handleApprove(courier.id)}
                        disabled={approving === courier.id}
                        className="btn-primary btn-sm flex items-center gap-1.5"
                      >
                        {approving === courier.id ? (
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <><CheckCircle size={14} /> Setujui Registrasi</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* --- ACTIVE TASKS TAB --- */
        <div className="space-y-3">
          {activeTasks.length === 0 ? (
            <div className="card text-center py-16">
              <Truck size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="text-dark-400">Tidak ada kurir yang sedang menjalankan tugas</p>
            </div>
          ) : (
            activeTasks.map((task) => (
              <div key={task.id} className="card animate-fade-in">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-dark/10 rounded-xl flex items-center justify-center text-dark font-bold">
                      <Truck size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-dark-700">{task.courier?.name}</h4>
                        <span className={taskStatusBadge[task.status] || 'badge bg-gray-100 text-gray-600'}>
                          {task.status}
                        </span>
                      </div>
                      <p className="text-xs text-dark-400">Order #{task.order_id}</p>
                      <p className="text-xs text-dark-300 flex items-center gap-1">
                        <MapPin size={11} /> {task.order?.laundry_location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-dark-600">⚖️ {task.weight || 0} kg</p>
                    <p className="text-xs text-dark-400 font-mono">Rp {Number(task.total_price || 0).toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
