import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { getProfileAPI, updateProfileAPI } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Lock, Save, AlertCircle, ShoppingCart } from 'lucide-react';

export default function ProfilePage() {
  const { user: authUser, login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    laundry_name: '',
    address: '',
    password: '',
    password_confirmation: '',
  });

  const fetchProfile = async () => {
    try {
      const res = await getProfileAPI();
      const p = res.data;
      
      // Ambil data tambahan berdasarkan role
      let address = '';
      let laundryName = '';
      if (p.role === 'owner') {
        // Jika login sebagai Owner model, data ada di root. Jika User model, ada di owner_profile
        address = p.owner_profile?.laundry_address || p.laundry_address || '';
        laundryName = p.owner_profile?.laundry_name || p.laundry_name || '';
      } else {
        address = p.user_profile?.address || '';
      }

      setForm({
        ...form,
        name: p.name || '',
        email: p.email || '',
        phone: p.phone || '',
        laundry_name: laundryName,
        address: address,
      });
    } catch {
      toast.error('Gagal memuat profil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.password_confirmation) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }

    setSaving(true);
    try {
      // PERBAIKAN: Menggunakan updateProfileAPI sesuai endpoints.js
      const res = await updateProfileAPI(form);
      toast.success('Profil berhasil diperbarui');
      
      // Update local storage/context user data
      if (res.data.data) {
        login(res.data.data, localStorage.getItem('token'));
      }
      
      setForm(prev => ({ ...prev, password: '', password_confirmation: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <DashboardLayout title="Pengaturan Profil" subtitle="Kelola informasi pribadi dan keamanan akun Anda.">
      {loading ? (
        <div className="card h-64 bg-gray-100 animate-pulse" />
      ) : (
        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="card">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
                <User size={20} className="text-primary" />
                <h3 className="font-bold text-dark-700">Informasi Dasar</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="label">Nama Lengkap</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
                    <input name="name" className="input pl-10" value={form.name} onChange={handleChange} required />
                  </div>
                </div>

                {authUser?.role === 'owner' && (
                  <div>
                    <label className="label">Nama Laundry</label>
                    <div className="relative">
                      <ShoppingCart size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
                      <input name="laundry_name" className="input pl-10" value={form.laundry_name} onChange={handleChange} required placeholder="Contoh: KIK Laundry" />
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
                      <input name="email" type="email" className="input pl-10" value={form.email} onChange={handleChange} required />
                    </div>
                  </div>
                  <div>
                    <label className="label">Nomor HP</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
                      <input name="phone" className="input pl-10" value={form.phone} onChange={handleChange} required />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="label">Alamat {authUser?.role === 'owner' ? 'Laundry' : ''}</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-4 text-dark-300" />
                    <textarea name="address" className="input pl-10 h-24 pt-3" value={form.address} onChange={handleChange} required placeholder="Masukkan alamat lengkap..."></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
                <Lock size={20} className="text-primary" />
                <h3 className="font-bold text-dark-700">Keamanan (Ganti Password)</h3>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-5 flex items-start gap-3">
                <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-700 leading-relaxed">
                  Kosongkan field di bawah jika Anda tidak ingin mengganti password.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Password Baru</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
                    <input name="password" type="password" className="input pl-10" value={form.password} onChange={handleChange} placeholder="Minimal 6 karakter" />
                  </div>
                </div>
                <div>
                  <label className="label">Konfirmasi Password Baru</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
                    <input name="password_confirmation" type="password" className="input pl-10" value={form.password_confirmation} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 px-8 py-3">
                {saving ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={18} />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}
