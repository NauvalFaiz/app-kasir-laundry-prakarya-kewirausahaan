import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getServicesAPI, addServiceAPI, updateServiceAPI } from '../../api/endpoints';
import toast from 'react-hot-toast';
import { Plus, Pencil, X, Check, Settings2 } from 'lucide-react';

const UNIT_TYPES = ['kg', 'pcs'];

function ServiceModal({ service, onClose, onSave }) {
  const isEdit = !!service?.id;
  const [form, setForm] = useState({
    name: service?.name || '',
    unit_type: service?.unit_type || 'kg',
    price: service?.price || '',
    image_url: service?.image_url || '',
    is_active: service?.is_active ?? true,
  });
  const [loading, setLoading] = useState(false);

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleSave = async () => {
    if (!form.name || !form.price) { toast.error('Nama dan harga wajib diisi'); return; }
    setLoading(true);
    try {
      if (isEdit) {
        await updateServiceAPI(service.id, form);
        toast.success('Layanan berhasil diperbarui');
      } else {
        await addServiceAPI(form);
        toast.success('Layanan berhasil ditambahkan');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-dark-700">{isEdit ? 'Edit Layanan' : 'Tambah Layanan'}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Nama Layanan <span className="text-red-500">*</span></label>
            <input className="input" placeholder="Cuci Kering, Cuci Setrika..." value={form.name} onChange={set('name')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Satuan <span className="text-red-500">*</span></label>
              <select className="input" value={form.unit_type} onChange={set('unit_type')}>
                {UNIT_TYPES.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Harga (Rp) <span className="text-red-500">*</span></label>
              <input type="number" className="input" placeholder="5000" value={form.price} onChange={set('price')} />
            </div>
          </div>
          <div>
            <label className="label">Link Gambar Layanan (Opsional)</label>
            <input className="input" placeholder="https://example.com/image.jpg" value={form.image_url} onChange={set('image_url')} />
          </div>
          {isEdit && (
            <div className="flex items-center gap-3">
              <input type="checkbox" id="is_active" checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 accent-primary"
              />
              <label htmlFor="is_active" className="text-sm text-dark-600">Layanan aktif</label>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-ghost flex-1">Batal</button>
          <button onClick={handleSave} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={16}/> Simpan</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OwnerServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | {} | { id, ...}

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await getServicesAPI();
      setServices(res.data.data || []);
    } catch {
      toast.error('Gagal memuat layanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleSave = () => { setModal(null); fetch(); };

  return (
    <DashboardLayout title="Manajemen Layanan" subtitle="Tambah dan kelola layanan laundry toko Anda.">
      <div className="flex justify-end mb-4">
        <button onClick={() => setModal({})} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Tambah Layanan
        </button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="card h-28 bg-gray-100 animate-pulse" />)}
        </div>
      ) : services.length === 0 ? (
        <div className="card text-center py-16">
          <Settings2 size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-dark-400 mb-4">Belum ada layanan. Tambah layanan pertama Anda!</p>
          <button onClick={() => setModal({})} className="btn-primary mx-auto">Tambah Layanan</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((svc) => (
            <div key={svc.id} className="card-hover flex flex-col gap-3">
              {svc.image_url && (
                <div className="w-full h-32 rounded-xl overflow-hidden mb-2 bg-gray-100">
                  <img src={svc.image_url} alt={svc.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-dark-700">{svc.name}</h4>
                  <p className="text-sm text-dark-400 mt-0.5">per {svc.unit_type}</p>
                </div>
                <span className={`badge ${svc.is_active ? 'badge-approved' : 'bg-gray-100 text-gray-500 badge'}`}>
                  {svc.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <p className="text-2xl font-bold text-primary">Rp {Number(svc.price).toLocaleString('id-ID')}</p>
              <button
                onClick={() => setModal(svc)}
                className="btn-outline btn-sm flex items-center gap-1.5 mt-auto"
              >
                <Pencil size={13} />
                Edit Layanan
              </button>
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <ServiceModal service={modal} onClose={() => setModal(null)} onSave={handleSave} />
      )}
    </DashboardLayout>
  );
}
