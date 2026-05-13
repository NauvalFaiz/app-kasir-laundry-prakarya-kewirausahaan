import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import {
  adminOrdersAPI, assignOrderAPI, updateStepAPI, inputWeightAPI, deliveryBackAPI, courierConfirmPaymentAPI
} from '../../api/endpoints';
import toast from 'react-hot-toast';
import { Package, RefreshCw, Truck, Scale, ArrowRight, MapPin, Info, CheckCircle2, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const getActions = (order) => {
  const actions = [];
  const s = order.status;
  if (s === 'pending') actions.push({ label: 'Ambil Pesanan', action: 'assign', color: 'btn-primary' });
  if (s === 'pickup') actions.push({ label: 'Mulai Timbang', action: 'weighing', color: 'btn-dark' });
  if (s === 'weighing') actions.push({ label: 'Input Berat & Antar', action: 'inputWeight', color: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-colors' });
  if (s === 'done') actions.push({ label: 'Antar Balik', action: 'delivery_back', color: 'btn-primary' });
  if (s === 'delivery_back') actions.push({ label: 'Sudah Dikirim', action: 'shipped', color: 'btn-dark' });
  if (s === 'shipped') actions.push({ label: 'Selesai', action: 'completed', color: 'bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-1.5 rounded-lg text-sm transition-colors' });
  return actions;
};

const STATUS_BADGES = {
  pending: 'badge-pending', pickup: 'badge-pickup', weighing: 'badge-process',
  to_laundry: 'badge-process', received: 'badge-active', process: 'badge-process',
  done: 'badge-done', delivery_back: 'badge-pickup', shipped: 'badge-active',
  completed: 'badge-completed', paid: 'badge-paid',
};

function WeightModal({ order, onClose, onSubmit }) {
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);

  const pricePerUnit = order.service?.price || 0;
  const unit = order.service?.unit_type || 'kg';
  const total = weight ? Number(weight) * pricePerUnit : 0;

  const handleSubmit = async () => {
    if (!weight) { toast.error(`Isi ${unit === 'kg' ? 'berat' : 'jumlah'}`); return; }
    setLoading(true);
    try {
      await inputWeightAPI({ order_id: order.id, weight });
      toast.success('Berhasil diinput, antar ke toko laundry!');
      onSubmit();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal input data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-slide-up">
        <div className="flex items-center gap-2 mb-5">
          <Scale size={20} className="text-primary" />
          <h3 className="font-bold text-dark-700">Input {unit === 'kg' ? 'Berat' : 'Jumlah'} Cucian</h3>
        </div>
        
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 text-blue-700 font-bold mb-1">
            <Info size={14} />
            <span className="text-sm">Layanan: {order.service?.name}</span>
          </div>
          <p className="text-xs text-blue-600">Harga Fixed: Rp {Number(pricePerUnit).toLocaleString('id-ID')} / {unit}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">{unit === 'kg' ? 'Berat (kg)' : 'Jumlah (pcs)'}</label>
            <input type="number" step="0.1" className="input text-lg font-bold" placeholder="0.0"
              value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
            <p className="text-xs text-dark-400 mb-1">Total Biaya yang Ditagihkan</p>
            <p className="text-2xl font-black text-primary">Rp {total.toLocaleString('id-ID')}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-ghost flex-1">Batal</button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Simpan & Antar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CourierQrisModal({ order, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await courierConfirmPaymentAPI(order.id);
      toast.success('Pembayaran QRIS Berhasil Dikonfirmasi!');
      onConfirm();
    } catch (err) {
      toast.error('Gagal mengkonfirmasi pembayaran');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
        <h3 className="font-black text-xl text-dark-700 mb-2">Scan QRIS</h3>
        <p className="text-sm text-gray-500 mb-6">Minta pelanggan scan kode QR ini untuk membayar pesanan.</p>
        
        <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-100 mb-6 shadow-inner flex justify-center w-full">
          <QRCodeSVG 
            value={order.payment_code || `QRIS-${order.id}`} 
            size={220} 
            fgColor="#000000" 
          />
        </div>
        
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">TOTAL BAYAR</p>
        <p className="text-3xl font-black text-primary mb-8">Rp {Number(order.total_price).toLocaleString('id-ID')}</p>
        
        <div className="w-full space-y-3">
          <button 
            onClick={handleConfirm}
            disabled={loading}
            className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all flex justify-center items-center gap-2"
          >
            {loading ? (
              <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <> <CheckCircle2 size={24} /> SUDAH DIBAYAR </>
            )}
          </button>
          <button 
            onClick={onClose}
            disabled={loading}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CourierTasks() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [weightModal, setWeightModal] = useState(null);
  const [qrisModalOrder, setQrisModalOrder] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await adminOrdersAPI();
      const all = res.data.data || [];
      setOrders(all.filter(o => ['pending','pickup','weighing','to_laundry','done','delivery_back','shipped'].includes(o.status)));
    } catch {
      toast.error('Gagal memuat data pesanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const doAction = async (action, order) => {
    if (action === 'inputWeight') { setWeightModal(order); return; }
    setActionLoading(`${order.id}-${action}`);
    try {
      if (action === 'assign') {
        await assignOrderAPI({ order_id: order.id });
        toast.success('Pesanan berhasil diambil!');
      } else if (action === 'weighing') {
        await updateStepAPI({ order_id: order.id, status: 'weighing' });
        toast.success('Status: Mulai Menimbang');
      } else if (['delivery_back','shipped','completed'].includes(action)) {
        await deliveryBackAPI({ order_id: order.id, status: action });
        toast.success('Status diperbarui!');
      } else if (action === 'confirm') {
        await courierConfirmPaymentAPI(order.id);
        toast.success('Pembayaran dikonfirmasi oleh kurir!');
      }
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal melakukan aksi');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout title="Tugas Pengiriman" subtitle="Kelola pesanan pelanggan dari pickup hingga delivery balik.">
      <div className="flex justify-end mb-4">
        <button onClick={fetch} className="btn-ghost flex items-center gap-1.5 text-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card h-24 bg-gray-100 animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <div className="card text-center py-16">
          <Truck size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-dark-400">Tidak ada tugas tersedia</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const actions = getActions(order);
            const isAL = (act) => actionLoading === `${order.id}-${act}`;
            const canConfirm = order.payment_status !== 'paid' && (order.payment_method === 'tunai' || order.payment_method === 'qris');

            return (
              <div key={order.id} className="card animate-fade-in border-l-4 border-primary">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-dark-700">Order #{order.id}</span>
                      <span className={STATUS_BADGES[order.status] || 'badge bg-gray-100 text-gray-600'}>
                        {order.status}
                      </span>
                      <span className={order.payment_status === 'paid' ? 'badge-paid' : 'badge-unpaid'}>
                        {order.payment_status}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-primary mb-1">{order.service?.name}</p>
                    <p className="text-sm text-dark-500 flex items-center gap-1">
                      <MapPin size={13} className="text-dark-400" />
                      {order.laundry_location}
                    </p>
                    <p className="text-xs text-dark-400 mt-1">
                      💳 {order.payment_method?.toUpperCase()} · {order.pickup_type}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* Pembayaran Tunai */}
                    {order.payment_status !== 'paid' && order.payment_method === 'tunai' && ['to_laundry', 'received', 'process', 'done', 'delivery_back', 'shipped'].includes(order.status) && (
                      <button
                        onClick={() => doAction('confirm', order)}
                        disabled={isAL('confirm')}
                        className="bg-green-600 hover:bg-green-700 text-white btn-sm rounded-lg font-semibold flex items-center gap-1 transition-colors shadow-sm"
                      >
                        {isAL('confirm') ? '...' : <><CheckCircle2 size={14}/> Terima Tunai</>}
                      </button>
                    )}

                    {/* Tampilkan QRIS */}
                    {order.payment_status !== 'paid' && order.payment_method === 'qris' && ['to_laundry', 'received', 'process', 'done', 'delivery_back', 'shipped'].includes(order.status) && (
                      <button
                        onClick={() => setQrisModalOrder(order)}
                        className="bg-purple-600 hover:bg-purple-700 text-white btn-sm rounded-lg font-semibold flex items-center gap-1 transition-colors shadow-sm"
                      >
                        <QrCode size={14}/> Tampilkan QRIS
                      </button>
                    )}

                    {actions.map(({ label, action, color }) => (
                      <button
                        key={action}
                        onClick={() => doAction(action, order)}
                        disabled={isAL(action)}
                        className={`${color} flex items-center gap-1.5 shadow-sm`}
                      >
                        {isAL(action) ? (
                          <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                        ) : (
                          <><ArrowRight size={13} /> {label}</>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {weightModal && (
        <WeightModal
          order={weightModal}
          onClose={() => setWeightModal(null)}
          onSubmit={() => { setWeightModal(null); fetch(); }}
        />
      )}

      {qrisModalOrder && (
        <CourierQrisModal
          order={qrisModalOrder}
          onClose={() => setQrisModalOrder(null)}
          onConfirm={() => { setQrisModalOrder(null); fetch(); }}
        />
      )}
    </DashboardLayout>
  );
}
