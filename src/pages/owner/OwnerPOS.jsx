import { useState, useEffect, useRef } from 'react';
import { getServicesAPI, createOfflineOrderAPI, confirmPaymentAPI } from '../../api/endpoints';
import { QRCodeSVG } from 'qrcode.react';
import DashboardLayout from '../../components/DashboardLayout';
import toast from 'react-hot-toast';
import { 
  Search, Plus, Minus, Trash2, Printer, 
  ShoppingCart, X, CheckCircle2, UserCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function OwnerPOS() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  
  // Cart State
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('Pelanggan Offline');
  const [userPhone, setUserPhone] = useState('');
  const [manualDiscount, setManualDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('tunai');
  const [imageLink, setImageLink] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Receipt State
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrderData, setLastOrderData] = useState(null);
  
  // QRIS State
  const [qrisData, setQrisData] = useState(null);
  const [confirmingQris, setConfirmingQris] = useState(false);

  const fetchServices = async () => {
    try {
      const res = await getServicesAPI();
      setServices(res.data.data || []);
    } catch {
      toast.error('Gagal memuat layanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const addToCart = (service) => {
    const existing = cart.find(item => item.service_id === service.id);
    if (existing) {
      setCart(cart.map(item => 
        item.service_id === service.id 
          ? { ...item, qty: item.qty + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { 
        id: Date.now(),
        service_id: service.id, 
        name: service.name, 
        price: service.price, 
        unit_type: service.unit_type, 
        qty: 1, 
        note: '' 
      }]);
    }
  };

  const updateQty = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0.1, Number((item.qty + delta).toFixed(2)));
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const updateQtyDirect = (id, val) => {
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setCart(cart.map(item => item.id === id ? { ...item, qty: num } : item));
    }
  };

  const updateNote = (id, note) => {
    setCart(cart.map(item => item.id === id ? { ...item, note } : item));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const totalCart = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Keranjang masih kosong');
      return;
    }

    setIsProcessing(true);
    try {
      // Create order for each item in the cart (since backend schema requires 1 service per order)
      const promises = cart.map(item => 
        createOfflineOrderAPI({
          service_id: item.service_id,
          weight: item.qty,
          payment_method: paymentMethod,
          image_url: paymentMethod === 'loan' ? imageLink : null,
          user_phone: userPhone,
          manual_discount: manualDiscount
        })
      );
      
      const results = await Promise.all(promises);
      const createdOrders = results.map(r => r.data.data);
      
      // Save data for receipt
      const orderData = {
        date: new Date().toLocaleString('id-ID'),
        customer: customerName,
        items: [...cart],
        subtotal: totalCart,
        discount: manualDiscount,
        total: Math.max(0, totalCart - manualDiscount),
        payment: paymentMethod,
        orderIds: createdOrders.map(o => o.id).join(', '),
        rawOrders: createdOrders
      };

      setCart([]);
      setCustomerName('Pelanggan Offline');
      setUserPhone('');
      setManualDiscount(0);

      if (paymentMethod === 'tunai' || paymentMethod === 'loan') {
        // Langsung confirm payment untuk tunai, tapi biarkan unpaid jika loan?
        // User minta "kasir loan", biasanya loan itu belum lunas.
        // Di backend saya buat payment_status tetapkan unpaid.
        if (paymentMethod === 'tunai') {
          await Promise.all(createdOrders.map(o => confirmPaymentAPI(o.id)));
          toast.success('Pembayaran Tunai Berhasil!');
        } else {
          toast.success('Pesanan Loan Berhasil Dicatat!');
        }
        
        setLastOrderData(orderData);
        setShowReceipt(true);
      } else {
        // Tampilkan QRIS
        setLastOrderData(orderData);
        setQrisData(orderData);
      }

    } catch (error) {
      toast.error('Terjadi kesalahan saat memproses pembayaran');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmQrisPayment = async () => {
    setConfirmingQris(true);
    try {
      await Promise.all(qrisData.rawOrders.map(o => confirmPaymentAPI(o.id)));
      toast.success('Pembayaran QRIS Berhasil Dikonfirmasi!');
      setQrisData(null);
      setShowReceipt(true);
    } catch {
      toast.error('Gagal mengkonfirmasi pembayaran');
    } finally {
      setConfirmingQris(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredServices = services.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || s.unit_type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans print:bg-white print:h-auto">
      
      {/* ========================================================= */}
      {/* AREA UTAMA (PRODUK / LAYANAN) */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden print:hidden">
        {/* Header Kustom POS */}
        <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-4">
            <h1 className="font-black text-xl text-dark-700">POS<span className="text-primary">Kasir</span></h1>
            <div className="h-6 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2 text-sm font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Sistem Online
            </div>
          </div>
          
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari layanan laundry (contoh: Setrika, Cuci Basah)..."
                className="w-full bg-gray-50 border-none rounded-2xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/owner/orders')}
              className="text-sm font-bold text-gray-500 hover:text-red-500 bg-gray-50 hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
            >
              Keluar Kasir
            </button>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-500">Kasir Aktif</p>
                <p className="text-sm font-bold text-dark-700">{user?.name}</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <UserCircle size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {['all', 'kg', 'pcs'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  filter === f 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                }`}
              >
                {f === 'all' ? 'Semua Layanan' : `Per ${f.toUpperCase()}`}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1,2,3,4,5,6].map(i => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse border border-gray-100"></div>)}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 font-medium">Layanan tidak ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredServices.map(service => (
                <button
                  key={service.id}
                  onClick={() => addToCart(service)}
                  className="bg-white border border-gray-100 p-3 rounded-2xl text-left hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all group active:scale-95 flex flex-col"
                >
                  {service.image_url ? (
                    <div className="w-full h-24 rounded-xl overflow-hidden mb-3 bg-gray-50">
                      <img src={service.image_url} alt={service.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
                      <Plus size={18} />
                    </div>
                  )}
                  <h3 className="font-bold text-dark-700 leading-tight mb-1 text-sm line-clamp-1">{service.name}</h3>
                  <p className="text-sm font-black text-primary">Rp {service.price.toLocaleString('id-ID')} <span className="text-[10px] font-normal text-gray-400">/{service.unit_type}</span></p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* SIDEBAR KERANJANG (CART) */}
      {/* ========================================================= */}
      <div className="w-96 bg-white border-l border-gray-100 flex flex-col h-full shadow-xl shadow-gray-200/50 z-20 print:hidden">
        {/* Cart Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg text-dark-700 flex items-center gap-2">
              <ShoppingCart size={20} className="text-primary"/> 
              Detail Pesanan
            </h2>
            <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-md">
              {cart.length} item
            </span>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Nama Pelanggan (Opsional)</label>
              <input 
                type="text" 
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold text-dark-700 focus:bg-white focus:border-primary transition-all"
                placeholder="Masukkan nama..."
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">No. HP User (Untuk Poin/Level)</label>
              <input 
                type="text" 
                value={userPhone}
                onChange={e => setUserPhone(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold text-dark-700 focus:bg-white focus:border-primary transition-all"
                placeholder="08123xxx"
              />
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-70">
              <ShoppingCart size={48} className="mb-4" />
              <p className="text-sm font-medium">Keranjang masih kosong</p>
              <p className="text-xs mt-1">Pilih layanan di sebelah kiri</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm relative group">
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="absolute -top-2 -right-2 bg-white text-gray-400 hover:text-red-500 border border-gray-100 hover:border-red-100 rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X size={14} />
                </button>
                
                <h4 className="font-bold text-sm text-dark-700 pr-4">{item.name}</h4>
                <div className="flex justify-between items-end mt-3">
                  <div className="flex items-center bg-gray-50 rounded-lg border border-gray-100 p-1">
                    <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-primary transition-colors"><Minus size={14}/></button>
                    <input 
                      type="number" 
                      value={item.qty}
                      onChange={e => updateQtyDirect(item.id, e.target.value)}
                      className="w-12 text-center text-sm font-bold bg-transparent border-none p-0 focus:ring-0" 
                      min="0.1"
                      step="0.1"
                    />
                    <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-primary transition-colors"><Plus size={14}/></button>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-medium mb-0.5">Rp {item.price.toLocaleString('id-ID')} / {item.unit_type}</p>
                    <p className="text-sm font-black text-dark-700">Rp {(item.price * item.qty).toLocaleString('id-ID')}</p>
                  </div>
                </div>
                
                <input 
                  type="text" 
                  value={item.note}
                  onChange={e => updateNote(item.id, e.target.value)}
                  placeholder="Catatan (contoh: jangan digosok)..."
                  className="w-full mt-3 bg-gray-50 border-none rounded-lg text-xs px-3 py-2 text-gray-600 placeholder:text-gray-400 focus:ring-1 focus:ring-primary/30"
                />
              </div>
            ))
          )}
        </div>

        {/* Checkout Section */}
        <div className="bg-white border-t border-gray-100 p-6 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
          
          <div className="mb-4">
             <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Metode Pembayaran</label>
             <div className="grid grid-cols-3 gap-2">
               {['tunai', 'qris', 'loan'].map(m => (
                 <button 
                  key={m} 
                  onClick={() => setPaymentMethod(m)} 
                  className={`py-2 rounded-xl text-xs font-bold uppercase tracking-wide border-2 transition-all flex justify-center items-center gap-1.5 ${
                    paymentMethod === m 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-gray-100 text-gray-400 hover:border-gray-200'
                  }`}
                 >
                   {paymentMethod === m && <CheckCircle2 size={14} />}
                   {m}
                 </button>
               ))}
             </div>
          </div>

          {paymentMethod === 'loan' && (
            <div className="mb-4 animate-slide-up">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Link Foto Bukti / Jaminan</label>
              <input 
                type="text" 
                value={imageLink}
                onChange={e => setImageLink(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-white focus:border-primary transition-all"
              />
            </div>
          )}

          <div className="mb-4 p-3 bg-red-50 rounded-2xl border border-red-100">
            <label className="text-[10px] font-bold text-red-400 uppercase tracking-wider block mb-1">Diskon Tambahan (Rp)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400 font-bold text-sm">Rp</span>
              <input 
                type="number" 
                value={manualDiscount}
                onChange={e => setManualDiscount(Number(e.target.value))}
                className="w-full bg-white border border-red-100 rounded-xl pl-10 pr-4 py-2 text-sm font-black text-red-600 focus:ring-2 focus:ring-red-200 transition-all"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-gray-500">Subtotal</span>
            <span className="font-bold text-dark-700">Rp {totalCart.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-gray-500">Diskon</span>
            <span className="font-bold text-red-500">- Rp {manualDiscount.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex items-center justify-between mb-4 pt-2 border-t border-gray-100">
            <span className="font-bold text-gray-500">Total Tagihan</span>
            <span className="font-black text-2xl text-primary">Rp {Math.max(0, totalCart - manualDiscount).toLocaleString('id-ID')}</span>
          </div>

          <button 
            onClick={handleCheckout} 
            disabled={isProcessing || cart.length === 0}
            className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black text-lg shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 active:scale-[0.98]"
          >
            {isProcessing ? (
              <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              'BAYAR SEKARANG'
            )}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL QRIS */}
      {/* ========================================================= */}
      {qrisData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in print:hidden">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
            <h3 className="font-black text-xl text-dark-700 mb-2">Scan QRIS</h3>
            <p className="text-sm text-gray-500 mb-6">Silakan minta pelanggan scan kode QR di bawah ini untuk membayar.</p>
            
            <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-100 mb-6 shadow-inner">
              <QRCodeSVG 
                value={qrisData.rawOrders[0]?.payment_code || `QRIS-${Date.now()}`} 
                size={220} 
                fgColor="#000000" 
              />
            </div>
            
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">TOTAL BAYAR</p>
            <p className="text-3xl font-black text-primary mb-8">Rp {qrisData.total.toLocaleString('id-ID')}</p>
            
            <div className="w-full space-y-3">
              <button 
                onClick={confirmQrisPayment}
                disabled={confirmingQris}
                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all flex justify-center items-center gap-2"
              >
                {confirmingQris ? (
                  <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <> <CheckCircle2 size={24} /> SUDAH SELESAI </>
                )}
              </button>
              <button 
                onClick={() => setQrisData(null)}
                disabled={confirmingQris}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all"
              >
                Batal / Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL / OVERLAY STRUK (PRINT) */}
      {/* ========================================================= */}
      {showReceipt && lastOrderData && (
        <div className="fixed inset-0 z-50 flex justify-center bg-black/60 backdrop-blur-sm p-4 print:p-0 print:bg-white print:block overflow-y-auto">
          
          {/* Action Buttons (Hidden in Print) */}
          <div className="absolute top-6 right-6 flex flex-col gap-3 print:hidden animate-fade-in z-50">
            <button onClick={handlePrint} className="bg-primary text-white p-4 rounded-2xl shadow-xl hover:scale-105 transition-transform flex items-center gap-2 font-bold">
              <Printer size={24} /> Cetak Struk
            </button>
            <button onClick={() => setShowReceipt(false)} className="bg-white text-dark-700 p-4 rounded-2xl shadow-xl hover:scale-105 transition-transform flex items-center gap-2 font-bold justify-center">
              <X size={20} /> Tutup
            </button>
          </div>

          {/* Kertas Struk */}
          <div className="bg-white w-full max-w-[80mm] min-h-[500px] mx-auto p-6 shadow-2xl animate-slide-up print:shadow-none print:m-0 print:w-[80mm] print:absolute print:top-0 print:left-0 font-mono text-sm text-black">
            
            <div className="text-center mb-6">
              <h1 className="font-black text-2xl mb-1 uppercase">{user?.owner_profile?.laundry_name || user?.laundry_name || 'KIK LAUNDRY'}</h1>
              <p className="text-[10px] leading-tight px-4">{user?.owner_profile?.laundry_address || user?.laundry_address || 'Alamat belum diatur'}</p>
              <p className="text-[10px]">Telp: {user?.phone || '-'}</p>
              <div className="border-b-2 border-dashed border-gray-300 my-4"></div>
            </div>

            <div className="text-xs mb-4">
              <div className="flex justify-between mb-1">
                <span>Tanggal</span>
                <span>{lastOrderData.date}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Kasir</span>
                <span>{user?.name}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Pelanggan</span>
                <span className="font-bold">{lastOrderData.customer}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Metode</span>
                <span className="uppercase">{lastOrderData.payment}</span>
              </div>
              <div className="flex justify-between">
                <span>ID Ref</span>
                <span className="truncate max-w-[100px] text-right">{lastOrderData.orderIds}</span>
              </div>
            </div>

            <div className="border-b-2 border-dashed border-gray-300 mb-4"></div>

            <div className="space-y-3 mb-4">
              {lastOrderData.items.map((item, idx) => (
                <div key={idx} className="text-xs">
                  <div className="font-bold mb-0.5">{item.name}</div>
                  <div className="flex justify-between">
                    <span>{item.qty} {item.unit_type} x {item.price}</span>
                    <span>{(item.qty * item.price).toLocaleString('id-ID')}</span>
                  </div>
                  {item.note && <div className="text-[10px] italic mt-0.5">Catatan: {item.note}</div>}
                </div>
              ))}
            </div>

            <div className="border-b-2 border-dashed border-gray-300 mb-4"></div>

            <div className="text-xs space-y-1 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rp {lastOrderData.subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Diskon</span>
                <span>- Rp {lastOrderData.discount.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="border-b-2 border-dashed border-gray-300 mb-4"></div>

            <div className="flex justify-between text-base font-black mb-6">
              <span>TOTAL</span>
              <span>Rp {lastOrderData.total.toLocaleString('id-ID')}</span>
            </div>

            <div className="text-center text-xs mt-8">
              <p className="font-bold mb-1 uppercase">Terima Kasih</p>
              <p className="mb-4">Barang yang tidak diambil dalam 30 hari di luar tanggung jawab kami.</p>
              <div className="border-t border-gray-100 pt-4 mt-4 opacity-50">
                <p className="text-[9px] tracking-widest font-bold">SUPPORT BY NAUVAL</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Global Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed.inset-0.bg-black\\/60 {
            background: white !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            padding: 0 !important;
          }
          .max-w-\\[80mm\\] {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          .max-w-\\[80mm\\] * {
            visibility: visible;
          }
          @page {
            margin: 0;
            size: 80mm auto; /* 80mm receipt printer size */
          }
        }
      `}} />

    </div>
  );
}
