import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerCourierAPI } from '../api/endpoints';
import toast from 'react-hot-toast';
import { WashingMachine, Eye, EyeOff, Truck, ArrowLeft, Store } from 'lucide-react';

export default function RegisterCourierPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      toast.error('Password tidak cocok');
      return;
    }

    setLoading(true);
    try {
      await registerCourierAPI(form);
      toast.success('Registrasi kurir berhasil! Menunggu persetujuan admin.');
      navigate('/login?role=kurir');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center px-4 py-12">
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
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Truck size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-dark-700">Daftar Kurir</h2>
                <p className="text-sm text-dark-400">Bergabung sebagai mitra pengiriman</p>
              </div>
            </div>
            <Link to="/login" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              <ArrowLeft size={14} /> Kembali ke Login
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nama Lengkap <span className="text-red-500">*</span></label>
              <input className="input" placeholder="Nama sesuai KTP" value={form.name} onChange={set('name')} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" placeholder="email@example.com" value={form.email} onChange={set('email')} />
              </div>
              <div>
                <label className="label">Nomor HP <span className="text-red-500">*</span></label>
                <input type="tel" className="input" placeholder="08xxxxxxxxx" value={form.phone} onChange={set('phone')} required />
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

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800">
              ⚠️ Akun kurir memerlukan verifikasi admin sebelum dapat bertugas.
            </div>

            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
              {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Daftar Menjadi Kurir'}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-gray-50 pt-6">
            <p className="text-sm text-dark-400">
              Memiliki bisnis laundry sendiri?
            </p>
            <Link to="/register/owner" className="inline-flex items-center gap-2 mt-2 text-primary font-bold hover:underline">
              <Store size={16} /> Daftar Sebagai Owner
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
