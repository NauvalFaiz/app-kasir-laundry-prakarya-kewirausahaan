import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import {
  ownerOrdersAPI, receiveOrderAPI, confirmPaymentAPI, updateOrderStatusAPI, getServicesAPI, createOfflineOrderAPI, deleteOrderAPI
} from '../../api/endpoints';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { Package, RefreshCw, X, QrCode, CheckCircle2, Plus, Trash2, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_BADGES = {
  pending: 'badge-pending', pickup: 'badge-pickup', weighing: 'badge-process',
  to_laundry: 'badge-process', received: 'badge-active', process: 'badge-process',
  done: 'badge-done', delivery_back: 'badge-pickup', shipped: 'badge-active',
  completed: 'badge-completed', paid: 'badge-paid', cancel: 'badge bg-gray-100 text-gray-600',
};

function QRModal({ order, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-dark-700">QR Pembayaran QRIS</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
            <QRCodeSVG value={order.payment_code || `ORDER-${order.id}`} size={200} fgColor="#104E89" />
          </div>
          <div className="text-center">
            <p className="text-xs text-dark-400">Kode Pembayaran</p>
            <p className="font-mono text-sm font-bold text-dark-700 mt-1 break-all">{order.payment_code}</p>
            <p className="text-lg font-bold text-primary mt-2">Rp {Number(order.total_price).toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center border border-gray-100">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Trash2 size={40} />
        </div>
        <h3 className="font-black text-2xl text-dark-700 mb-2">Hapus Riwayat?</h3>
        <p className="text-sm text-gray-500 mb-8 px-4">
          Apakah Anda yakin ingin menghapus pesanan ini dari riwayat? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex w-full gap-3">
          <button 
            onClick={onClose} 
            disabled={loading}
            className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition-all active:scale-95"
          >
            Batal
          </button>
          <button 
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-500/20 transition-all flex justify-center items-center active:scale-95"
          >
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Ya, Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OwnerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrOrder, setQrOrder] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await ownerOrdersAPI();
      setOrders(res.data || []);
      setCurrentPage(1); // Reset to page 1 on fetch
    } catch {
      toast.error('Gagal memuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const doAction = async (action, id, payload = null) => {
    setActionLoading(id + '-' + action);
    try {
      if (action === 'receive') await receiveOrderAPI(id);
      else if (action === 'confirm') await confirmPaymentAPI(id);
      else if (action === 'status') await updateOrderStatusAPI(id, payload);
      else if (action === 'delete') await deleteOrderAPI(id);
      
      toast.success('Berhasil diperbarui');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal melakukan aksi');
    } finally {
      setActionLoading(null);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const currentOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <DashboardLayout title="Manajemen Pesanan & Kasir" subtitle="Kelola pesanan online dan riwayat transaksi di sini.">
      <div className="flex justify-end items-center mb-6">
        <button onClick={fetch} className="btn-ghost text-sm flex items-center gap-1.5">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="card h-20 bg-gray-100 animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="card text-center py-16">
          <Package size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-dark-400">Belum ada pesanan</p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentOrders.map((order) => {
            const isAL = (act) => actionLoading === `${order.id}-${act}`;
            return (
              <div key={order.id} className="card animate-fade-in group">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-dark-700">Order #{order.id}</span>
                      <span className={STATUS_BADGES[order.status] || 'badge bg-gray-100 text-gray-600'}>
                        {order.status}
                      </span>
                      <span className={order.payment_status === 'paid' ? 'badge-paid' : 'badge-unpaid'}>
                        {order.payment_status}
                      </span>
                      {order.laundry_location === 'Offline' && (
                        <span className="badge bg-purple-100 text-purple-700 font-bold">OFFLINE</span>
                      )}
                      {order.pickup_type === 'self' && order.laundry_location !== 'Offline' && (
                        <span className="badge bg-cyan-100 text-cyan-700">📍 Antar Sendiri</span>
                      )}
                      {order.pickup_type === 'pickup' && (
                        <span className="badge bg-orange-100 text-orange-700">🛵 Dijemput Kurir</span>
                      )}
                      {order.delivery_type && (
                        <span className="badge bg-indigo-100 text-indigo-700">🚚 Delivery: {order.delivery_type}</span>
                      )}
                    </div>
                    <p className="text-sm text-dark-400">📍 {order.laundry_location}</p>
                    <p className="text-sm text-dark-400">
                      💰 Rp {Number(order.total_price).toLocaleString('id-ID')} ·{' '}
                      <span className="capitalize">{order.payment_method}</span>
                    </p>
                    {order.image_url && (
                      <a 
                        href={order.image_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded-md hover:bg-primary/10 transition-all"
                      >
                        <ShoppingCart size={10} /> LIHAT FOTO JAMINAN
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    {/* QRIS button */}
                    {order.payment_method === 'qris' && order.payment_status !== 'paid' && (
                      <button onClick={() => setQrOrder(order)} className="btn-outline btn-sm flex items-center gap-1">
                        <QrCode size={14} /> QR
                      </button>
                    )}

                    {/* Receive */}
                    {(order.status === 'to_laundry' || (order.pickup_type === 'self' && (order.status === 'pending' || order.status === 'paid'))) && (
                      <button onClick={() => doAction('receive', order.id)} disabled={isAL('receive')} className="btn-primary btn-sm">
                        {isAL('receive') ? '...' : 'Terima'}
                      </button>
                    )}

                    {/* Process */}
                    {order.status === 'received' && (
                      <button onClick={() => doAction('status', order.id, { status: 'process' })} disabled={isAL('status')} className="btn-primary btn-sm">
                        {isAL('status') ? '...' : 'Mulai Proses'}
                      </button>
                    )}

                    {/* Done */}
                    {order.status === 'process' && (
                      <button onClick={() => doAction('status', order.id, { status: 'done' })} disabled={isAL('status')} className="btn-dark btn-sm">
                        {isAL('status') ? '...' : 'Selesai'}
                      </button>
                    )}

                    {/* Handover to Customer (Self-delivery) */}
                    {order.status === 'done' && !order.delivery_type && (
                      <button onClick={() => doAction('status', order.id, { status: 'completed' })} disabled={isAL('status')} className="btn-active btn-sm text-white bg-green-600 hover:bg-green-700">
                        {isAL('status') ? '...' : 'Serahkan (Selesai)'}
                      </button>
                    )}

                    {/* Confirm payment */}
                    {order.payment_status !== 'paid' && (
                      <button onClick={() => doAction('confirm', order.id)} disabled={isAL('confirm')} className="bg-green-600 hover:bg-green-700 text-white btn-sm rounded-lg font-semibold flex items-center gap-1">
                        {isAL('confirm') ? '...' : <><CheckCircle2 size={14}/> Bayar</>}
                      </button>
                    )}

                    {/* Delete button (only for offline or pending) */}
                    {(order.laundry_location === 'Offline' || order.status === 'pending') && (
                      <button onClick={() => setDeleteModal(order)} className="p-2 text-dark-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 mt-6">
              <span className="text-sm text-dark-400">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, orders.length)} dari {orders.length} pesanan
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  <span className="text-sm font-medium">Lanjut</span>
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {qrOrder && <QRModal order={qrOrder} onClose={() => setQrOrder(null)} />}
      {deleteModal && (
        <DeleteConfirmModal 
          loading={actionLoading === `${deleteModal.id}-delete`}
          onClose={() => setDeleteModal(null)} 
          onConfirm={async () => {
            await doAction('delete', deleteModal.id);
            setDeleteModal(null);
          }} 
        />
      )}
    </DashboardLayout>
  );
}

