import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerOwnerAPI } from '../api/endpoints';
import toast from 'react-hot-toast';
import { WashingMachine, Eye, EyeOff, Store, ArrowLeft, Truck } from 'lucide-react';

export default function RegisterOwnerPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    laundry_name: '',
    laundry_address: '',
    phone: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      toast.error('Password dan konfirmasi password tidak cocok');
      return;
    }
    setLoading(true);
    try {
      await registerOwnerAPI(form);
      toast.success('Registrasi berhasil! Menunggu persetujuan admin.');
      navigate('/login?role=owner');
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        Object.values(errors).flat().forEach((msg) => toast.error(msg));
      } else {
        toast.error(err.response?.data?.message || 'Registrasi gagal');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary/5 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-glow">
              <WashingMachine size={24} className="text-white" />
            </div>
            <span className="font-bold text-2xl text-dark-700">KIK<span className="text-primary">Laundry</span></span>
          </Link>
        </div>

        <div className="card animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Store size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-dark-700">Daftar Owner</h2>
                <p className="text-sm text-dark-400">Kelola bisnis laundry Anda</p>
              </div>
            </div>
            <Link to="/login" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              <ArrowLeft size={14} /> Kembali ke Login
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Nama Lengkap <span className="text-red-500">*</span></label>
                <input className="input" placeholder="John Doe" value={form.name} onChange={set('name')} required />
              </div>
              <div>
                <label className="label">Nomor HP <span className="text-red-500">*</span></label>
                <input type="tel" className="input" placeholder="08xxxxxxxxx" value={form.phone} onChange={set('phone')} required />
              </div>
            </div>

            <div>
              <label className="label">Email <span className="text-red-500">*</span></label>
              <input type="email" className="input" placeholder="email@example.com" value={form.email} onChange={set('email')} required />
            </div>

            <div className="border-t border-gray-50 pt-4 mt-2">
              <p className="text-xs font-bold text-dark-300 uppercase tracking-widest mb-3">Informasi Laundry</p>
              <div className="space-y-4">
                <div>
                  <label className="label">Nama Toko Laundry <span className="text-red-500">*</span></label>
                  <input className="input" placeholder="Laundry Bersih Express" value={form.laundry_name} onChange={set('laundry_name')} required />
                </div>
                <div>
                  <label className="label">Alamat Toko <span className="text-red-500">*</span></label>
                  <textarea
                    className="input resize-none"
                    rows={2}
                    placeholder="Jl. Merdeka No. 1, Kota..."
                    value={form.laundry_address}
                    onChange={set('laundry_address')}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-gray-50 pt-4">
              <div>
                <label className="label">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input pr-9"
                    placeholder="Min. 6 karakter"
                    value={form.password}
                    onChange={set('password')}
                    required minLength={6}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-300">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Konfirmasi <span className="text-red-500">*</span></label>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input"
                  placeholder="Ulangi"
                  value={form.password_confirmation}
                  onChange={set('password_confirmation')}
                  required
                />
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
              ⚠️ Akun akan diverifikasi admin sebelum aktif.
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Daftar Sebagai Owner'}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-gray-50 pt-6">
            <p className="text-sm text-dark-400">
              Ingin bergabung sebagai mitra pengiriman?
            </p>
            <Link to="/register/courier" className="inline-flex items-center gap-2 mt-2 text-blue-600 font-bold hover:underline">
              <Truck size={16} /> Daftar Menjadi Kurir
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
