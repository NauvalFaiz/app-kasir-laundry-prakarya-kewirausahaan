import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginAPI } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { WashingMachine, Eye, EyeOff, LogIn, Store, Truck } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  
  // Deteksi role dari query params (contoh: /login?role=kurir)
  const queryParams = new URLSearchParams(location.search);
  const initialRole = queryParams.get('role') || 'owner';

  const [form, setForm] = useState({
    login: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginAPI(form);
      const { user, token } = res.data;
      
      login(user, token);
      toast.success(`Selamat datang kembali, ${user.name}!`);

      // Redirect berdasarkan role
      if (user.role === 'admin') navigate('/admin/laundries');
      else if (user.role === 'owner') navigate('/owner/dashboard');
      else if (user.role === 'kurir') navigate('/courier/dashboard');
      else navigate('/');
      
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login gagal, periksa kembali akun Anda');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary/5 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-glow">
              <WashingMachine size={24} className="text-white" />
            </div>
            <span className="font-bold text-2xl text-dark-700">KIK<span className="text-primary">Laundry</span></span>
          </Link>
        </div>

        <div className="card animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <LogIn size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-dark-700">Login Sistem</h2>
              <p className="text-sm text-dark-400">Masuk untuk mengelola laundry Anda</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email atau Nomor HP</label>
              <input 
                className="input" 
                placeholder="Masukkan email/no hp" 
                value={form.login}
                onChange={(e) => setForm({...form, login: e.target.value})}
                required 
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input 
                  type={showPass ? 'text' : 'password'}
                  className="input pr-10" 
                  placeholder="••••••••" 
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  required 
                />
                <button 
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-300 hover:text-dark-500"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Masuk Sekarang'
              )}
            </button>
          </form>

          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            <span className="relative bg-white px-4 text-xs text-dark-300 uppercase tracking-widest font-bold">Atau Daftar Baru</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link 
              to="/register/owner" 
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all group"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Store size={18} />
              </div>
              <span className="text-xs font-bold text-dark-600">Daftar Owner</span>
            </Link>
            
            <Link 
              to="/register/courier" 
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <Truck size={18} />
              </div>
              <span className="text-xs font-bold text-dark-600">Daftar Kurir</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
