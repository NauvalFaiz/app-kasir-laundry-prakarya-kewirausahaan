import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  WashingMachine, Truck, CreditCard, Star, Shield, Zap,
  ArrowRight, CheckCircle2, ChevronRight, Users
} from 'lucide-react';

const features = [
  {
    icon: WashingMachine,
    color: 'bg-primary/10 text-primary',
    title: 'Manajemen Owner Laundry',
    desc: 'Owner dapat mengelola layanan, memantau pesanan, dan mengkonfirmasi pembayaran secara real-time dari satu dashboard.',
  },
  {
    icon: Truck,
    color: 'bg-blue-50 text-blue-600',
    title: 'Kurir Tracking System',
    desc: 'Sistem pelacakan kurir dari pickup, penimbangan, pengiriman ke toko, hingga pengantaran balik ke pelanggan.',
  },
  {
    icon: CreditCard,
    color: 'bg-green-50 text-green-600',
    title: 'Kasir & Pembayaran',
    desc: 'Dukung pembayaran tunai dan QRIS. Konfirmasi pembayaran langsung di dashboard dengan tampilan QR yang jelas.',
  },
  {
    icon: Shield,
    color: 'bg-purple-50 text-purple-600',
    title: 'Multi-Role System',
    desc: 'Sistem role terpisah untuk Owner, Admin, dan Kurir dengan dashboard dan izin akses masing-masing.',
  },
  {
    icon: Zap,
    color: 'bg-yellow-50 text-yellow-600',
    title: 'Real-time Status',
    desc: 'Update status pesanan secara langsung — dari pending, proses laundry, hingga selesai dan dikirim balik.',
  },
  {
    icon: Star,
    color: 'bg-orange-50 text-orange-600',
    title: 'Sistem Review',
    desc: 'Pelanggan dapat memberikan rating dan ulasan untuk layanan laundry setelah pesanan selesai.',
  },
];

const steps = [
  { num: '01', title: 'Buat Pesanan', desc: 'Pelanggan membuat pesanan laundry dan memilih layanan.' },
  { num: '02', title: 'Kurir Pickup', desc: 'Kurir mengambil pakaian, menimbang, dan mengantar ke toko.' },
  { num: '03', title: 'Proses Laundry', desc: 'Owner memproses laundry dan update status secara live.' },
  { num: '04', title: 'Pengantaran Balik', desc: 'Kurir mengantar pakaian bersih kembali ke pelanggan.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-20 px-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-primary/5 pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-blue-50 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-3xl mx-auto text-center animate-slide-up">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
              <Zap size={14} />
              Platform Laundry Modern #1
            </span>

            <h1 className="text-5xl md:text-6xl font-extrabold text-dark-700 leading-tight mb-6">
              Kelola Laundry Anda<br />
              <span className="text-primary">Lebih Cerdas</span>
            </h1>
            <p className="text-lg text-dark-400 mb-10 max-w-xl mx-auto leading-relaxed">
              Platform manajemen laundry all-in-one untuk owner, admin, dan kurir.
              Lacak pesanan, kelola layanan, dan konfirmasi pembayaran dalam satu sistem.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register/owner" className="btn-primary flex items-center justify-center gap-2 text-base px-8 py-3.5">
                Mulai Gratis
                <ArrowRight size={18} />
              </Link>
              <Link to="/login?role=owner" className="btn-outline flex items-center justify-center gap-2 text-base px-8 py-3.5">
                Login Owner
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-dark-400">
              {['Tanpa biaya setup', 'Multi-role dashboard', 'Pembayaran QRIS & Tunai'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-green-500" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-dark-800 rounded-2xl p-1.5 shadow-2xl">
              <div className="bg-dark-900 rounded-xl overflow-hidden">
                {/* Fake browser bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-dark-800">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <div className="flex-1 ml-3 bg-dark-700 rounded-md h-6 px-3 flex items-center">
                    <span className="text-dark-300 text-xs">localhost:5173/owner/dashboard</span>
                  </div>
                </div>
                {/* Mock Dashboard */}
                <div className="p-6 bg-gray-50">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {[
                      { label: 'Total Pesanan', val: '248', color: 'bg-primary' },
                      { label: 'Pendapatan', val: 'Rp 4.8jt', color: 'bg-dark' },
                      { label: 'Pesanan Aktif', val: '12', color: 'bg-blue-600' },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="bg-white rounded-xl p-4 shadow-sm">
                        <div className={`w-8 h-8 ${color} rounded-lg mb-2`} />
                        <div className="text-xs text-gray-500">{label}</div>
                        <div className="text-xl font-bold text-dark-700">{val}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="text-xs font-semibold text-gray-500 mb-3">Pesanan Terbaru</div>
                    {['ORD-001', 'ORD-002', 'ORD-003'].map((id, i) => (
                      <div key={id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <span className="text-xs text-gray-600">{id}</span>
                        <span className={`badge ${i === 0 ? 'badge-process' : i === 1 ? 'badge-pickup' : 'badge-done'}`}>
                          {i === 0 ? 'Proses' : i === 1 ? 'Pickup' : 'Selesai'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-700 mb-4">
              Semua yang Anda Butuhkan
            </h2>
            <p className="text-dark-400 max-w-xl mx-auto">
              Dari manajemen laundry, tracking kurir, hingga sistem pembayaran — semua tersedia dalam satu platform.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="card-hover group">
                <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={22} />
                </div>
                <h3 className="font-bold text-dark-700 mb-2">{title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="about" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-700 mb-4">Cara Kerja</h2>
            <p className="text-dark-400 max-w-xl mx-auto">Alur pesanan laundry dari awal hingga selesai.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map(({ num, title, desc }, i) => (
              <div key={num} className="relative">
                <div className="card text-center">
                  <div className="text-4xl font-black text-primary/20 mb-3">{num}</div>
                  <h3 className="font-bold text-dark-700 mb-2">{title}</h3>
                  <p className="text-dark-400 text-xs leading-relaxed">{desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                    <ChevronRight size={20} className="text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary to-primary-700 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Siap Memulai?</h2>
          <p className="text-white/80 mb-8 text-lg">Daftarkan toko laundry atau bergabung sebagai kurir sekarang.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register/owner" className="bg-white text-primary font-semibold px-8 py-3.5 rounded-lg hover:bg-gray-50 transition-colors text-base flex items-center justify-center gap-2">
              <WashingMachine size={18} />
              Daftar sebagai Owner
            </Link>
            <Link to="/register/courier" className="bg-white/10 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-lg hover:bg-white/20 transition-colors text-base flex items-center justify-center gap-2">
              <Truck size={18} />
              Daftar sebagai Kurir
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-800 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <WashingMachine size={16} className="text-white" />
            </div>
            <span className="font-bold">KIKLaundry</span>
          </div>
          <p className="text-dark-300 text-sm">© 2026 KIK Laundry Management System. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/login?role=owner" className="text-dark-300 hover:text-white text-sm transition-colors">Login Owner</Link>
            <Link to="/login?role=admin" className="text-dark-300 hover:text-white text-sm transition-colors">Login Admin</Link>
            <Link to="/login?role=kurir" className="text-dark-300 hover:text-white text-sm transition-colors">Login Kurir</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
