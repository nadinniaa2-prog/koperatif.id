import React, { useState, useEffect } from 'react';
/* Lucide Icons for aesthetic value */
import { 
  Menu, X, LogOut, LayoutDashboard, Users, Wallet, 
  Package, FileText, Settings, ShoppingBag, 
  History, CreditCard, ChevronRight, GraduationCap,
  TrendingUp, BarChart3, Clock, AlertCircle, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useLocation, 
  useNavigate,
  Navigate
} from 'react-router-dom';
import { supabase } from './lib/supabase';
import { UserRole, Profile } from './types';
import MembersPage from './pages/app/Members';
import InventoryPOSPage from './pages/app/Inventory';
import FinancePage from './pages/app/Finance';
import SettingsPage from './pages/app/Settings';
import ReportsPage from './pages/app/Reports';
import HistoryPage from './pages/app/History';
import CatalogPage from './pages/app/Catalog';
import LoansPage from './pages/app/Loans';
import SecurityPage from './pages/app/Security';

// --- STUB COMPONENTS FOR PAGES ---
const LandingPage = () => {
  const coopName = localStorage.getItem('coop_name') || 'koperatif.id';
  const coopLogo = localStorage.getItem('coop_logo');

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-blue rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-sky-blue/20 overflow-hidden">
              {coopLogo ? <img src={coopLogo} alt="Logo" className="w-full h-full object-cover" /> : coopName[0].toUpperCase()}
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-deep-blue">
              {coopName.includes('.') ? (
                <>
                  {coopName.split('.')[0]}
                  <span className="text-sky-blue">.{coopName.split('.')[1]}</span>
                </>
              ) : (
                coopName
              )}
            </span>
          </div>
          <Link to="/login" className="bg-electric-blue text-white px-6 py-2.5 rounded-full font-semibold hover:bg-deep-blue transition-all shadow-md">Masuk Aplikasi</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 px-4 py-1.5 rounded-full text-sm font-bold mb-6"
          >
            <GraduationCap size={16} /> Solusi Koperasi Sekolah Modern
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-deep-blue mb-6 leading-tight"
          >
            Membangun Ekonomi <br /><span className="text-transparent bg-clip-text gradient-blue">Sekolah yang Mandiri</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Koperatif.id adalah platform digital terintegrasi untuk mengelola simpan pinjam, inventaris kantin, dan transaksi belanja siswa secara otomatis dan transparan.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link to="/login" className="gradient-blue text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:shadow-xl hover:shadow-electric-blue/30 transition-all">
              Mulai Sekarang <ChevronRight size={20} />
            </Link>
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-slate-100 text-slate-800 px-8 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
            >
              Lihat Demo
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Simpan Pinjam", desc: "Kelola setoran dan pinjaman anggota secara real-time dengan laporan otomatis.", icon: <Wallet className="text-sky-blue" size={32} /> },
              { title: "POS & Inventaris", desc: "Sistem kasir kantin dan unit usaha yang terhubung langsung dengan saldo siswa.", icon: <Package className="text-electric-blue" size={32} /> },
              { title: "Belanja Digital", desc: "Siswa bisa cek katalog dan belanja menggunakan saldo koperasi mereka.", icon: <ShoppingBag className="text-deep-blue" size={32} /> }
            ].map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 card-hover"
              >
                <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-bold text-deep-blue mb-3">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const isAdminEmail = email.toLowerCase() === 'admin@gmail.com';
      const isAdminPassword = password === 'adminkoperasi';

      if (isAdminEmail) {
        if (isAdminPassword) {
          localStorage.setItem('user_role', 'ADMIN');
          localStorage.setItem('user_email', email);
          navigate('/app');
        } else {
          setError('Kata sandi Admin salah!');
        }
      } else {
        // Untuk user lain, biarkan masuk dengan role ANGGOTA (seterah email/password)
        localStorage.setItem('user_role', 'ANGGOTA');
        localStorage.setItem('user_email', email);
        navigate('/app');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Terjadi kesalahan saat masuk.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-blue flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-10">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 gradient-blue rounded-2xl flex items-center justify-center text-white shadow-xl">
              <GraduationCap size={32} />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-center text-deep-blue mb-2">Selamat Datang</h2>
          <p className="text-center text-slate-500 mb-8">Masuk ke Dashboard Koperatif.id</p>
          
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-rose-50 text-rose-500 p-4 rounded-xl text-sm font-bold mb-6 flex items-center gap-2 border border-rose-100"
              >
                <X size={18} className="flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Email</label>
              <input 
                type="email" 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-blue outline-none transition-all text-sm"
                placeholder="email@sekolah.sch.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Kata Sandi</label>
              <input 
                type="password" 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-blue outline-none transition-all text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full gradient-blue text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-electric-blue/30 active:scale-[0.98] transition-all disabled:opacity-70"
            >
              {loading ? 'Memproses...' : 'Masuk Sekarang'}
            </button>
          </form>
        </div>
        <div className="bg-slate-50 p-6 text-center text-sm text-slate-500 border-t border-slate-100">
          Belum jadi anggota? Hubungi Admin Koperasi Sekolah.
        </div>
      </motion.div>
    </div>
  );
};

// --- APP LAYOUT & NAVIGATION ---
const AppLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [coopBranding, setCoopBranding] = useState({
    name: localStorage.getItem('coop_name') || 'koperatif.id',
    logo: localStorage.getItem('coop_logo')
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setCoopBranding({
        name: localStorage.getItem('coop_name') || 'koperatif.id',
        logo: localStorage.getItem('coop_logo')
      });
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const userRole = (localStorage.getItem('user_role') || 'ANGGOTA').toUpperCase() as UserRole;
  const userEmail = localStorage.getItem('user_email') || '';
  
  // Create a display name from email (e.g. "admin@gmail.com" -> "Admin")
  const displayName = userEmail 
    ? userEmail.split('@')[0].split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') 
    : 'User';

  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = userRole === 'ADMIN' ? [
    { label: 'Dashboard', path: '/app', icon: <LayoutDashboard size={22} /> },
    { label: 'Anggota', path: '/app/members', icon: <Users size={22} /> },
    { label: 'Simpan Pinjam', path: '/app/finance', icon: <Wallet size={22} /> },
    { label: 'Inventaris & POS', path: '/app/inventory', icon: <Package size={22} /> },
    { label: 'Laporan', path: '/app/reports', icon: <FileText size={22} /> },
    { label: 'Riwayat', path: '/app/history', icon: <History size={22} /> },
    { label: 'Pengaturan', path: '/app/settings', icon: <Settings size={22} /> },
  ] : [
    { label: 'Dashboard', path: '/app', icon: <LayoutDashboard size={22} /> },
    { label: 'Tabungan', path: '/app/finance', icon: <Wallet size={22} /> },
    { label: 'Pinjaman', path: '/app/loans', icon: <CreditCard size={22} /> },
    { label: 'Katalog Mart', path: '/app/catalog', icon: <ShoppingBag size={22} /> },
    { label: 'Riwayat', path: '/app/history', icon: <History size={22} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_savings_balance');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-deep-blue/40 backdrop-blur-sm z-[55] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? 280 : (windowWidth < 768 ? 0 : 80),
          x: (windowWidth < 768 && !isSidebarOpen) ? -280 : 0
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed md:relative z-[60] h-screen bg-deep-blue text-white overflow-y-auto flex flex-col shadow-2xl left-0 top-0 scrollbar-hide print:hidden ${
          windowWidth < 768 && !isSidebarOpen ? 'pointer-events-none' : 'pointer-events-auto'
        }`}
      >
        <div className="p-6 flex items-center gap-3 sticky top-0 bg-deep-blue z-10">
          <div className="w-10 h-10 bg-white text-deep-blue rounded-xl flex items-center justify-center font-black flex-shrink-0 overflow-hidden shadow-lg shadow-black/20">
            {coopBranding.logo ? (
              <img src={coopBranding.logo} alt="L" className="w-full h-full object-cover" />
            ) : (
              coopBranding.name[0].toUpperCase()
            )}
          </div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-xl font-bold tracking-tight whitespace-nowrap"
              >
                {coopBranding.name.includes('.') ? (
                  <>
                    {coopBranding.name.split('.')[0]}
                    <span className="text-sky-blue">.{coopBranding.name.split('.')[1]}</span>
                  </>
                ) : (
                  coopBranding.name
                )}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-4 mt-8 space-y-2 pb-24">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (windowWidth < 768) setSidebarOpen(false);
                }}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all relative z-10 ${
                  isActive 
                    ? 'bg-electric-blue text-white shadow-lg shadow-black/20' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5 active:bg-white/10'
                }`}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                <AnimatePresence mode="popLayout">
                  {isSidebarOpen && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="whitespace-nowrap font-bold text-sm tracking-wide"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 sticky bottom-0 bg-deep-blue border-t border-white/5">
          <button 
            type="button"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all cursor-pointer active:scale-95"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative overflow-x-hidden">
        {/* Top Navbar */}
        <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-40 print:hidden">
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => setSidebarOpen(prev => !prev)}
              className="md:hidden p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-deep-blue transition-all active:scale-95 border border-slate-100 shadow-sm relative z-[70]"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-deep-blue truncate max-w-[150px] sm:max-w-none">
              {menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-deep-blue">{displayName}</p>
              <p className="text-xs text-sky-blue font-bold uppercase tracking-widest">{userRole}</p>
            </div>
            <button 
              type="button"
              onClick={handleLogout}
              className="bg-slate-50 p-3 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-slate-100 cursor-pointer active:shadow-md active:scale-95 z-50 relative group"
              title="Keluar"
            >
              <LogOut size={20} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </header>


        <main className="p-8 print:p-0">
          <Routes>
            <Route path="/" element={<DashboardView role={userRole} />} />
            <Route path="/members" element={<MembersPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/inventory" element={<InventoryPOSPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/loans" element={<LoansPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="*" element={<DashboardView role={userRole} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const dashboardData = [
  { day: 'Sen', value: 1200000 },
  { day: 'Sel', value: 1800000 },
  { day: 'Rab', value: 1400000 },
  { day: 'Kam', value: 2100000 },
  { day: 'Jum', value: 2500000 },
  { day: 'Sab', value: 1300000 },
  { day: 'Min', value: 900000 },
];

const DashboardView = ({ role }: { role: UserRole }) => {
  const [stats, setStats] = useState({
    totalMembers: '1.240',
    totalSavings: 'Rp 45.2M',
    activeLoans: 'Rp 8.7M',
    martRevenue: 'Rp 12.4M',
  });

  const [promoProducts, setPromoProducts] = useState<any[]>([]);
  const [userBalance, setUserBalance] = useState(2500000);
  const [userLoanBill, setUserLoanBill] = useState(120000);
  const [chartData, setChartData] = useState<any[]>([
    { day: 'Sen', value: 1200000 },
    { day: 'Sel', value: 1800000 },
    { day: 'Rab', value: 1400000 },
    { day: 'Kam', value: 2100000 },
    { day: 'Jum', value: 2500000 },
    { day: 'Sab', value: 1300000 },
    { day: 'Min', value: 900000 },
  ]);

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'SALDO' | 'TUNAI'>('SALDO');
  const [paySuccess, setPaySuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const handlePayBill = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');

    const amountNum = Number(payAmount);
    if (!amountNum || amountNum <= 0) {
      setPaymentError('Nominal pembayaran harus lebih besar dari 0');
      return;
    }

    if (amountNum > userLoanBill) {
      setPaymentError(`Nominal tidak boleh melebihi sisa tagihan Anda (Rp ${userLoanBill.toLocaleString('id-ID')})`);
      return;
    }

    const currentUserName = localStorage.getItem('user_name') || 
      localStorage.getItem('user_email')?.split('@')[0].split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 
      'Ahmad Fauzi';

    // Check balance if paying with SALDO
    if (paymentMethod === 'SALDO') {
      const savedBalance = localStorage.getItem('user_savings_balance');
      const balanceNum = savedBalance ? Number(savedBalance) : 2500000;
      if (balanceNum < amountNum) {
        setPaymentError('Saldo koperasi Anda tidak mencukupi untuk melakukan pembayaran ini.');
        return;
      }

      // Deduct balance
      const newBalance = balanceNum - amountNum;
      localStorage.setItem('user_savings_balance', newBalance.toString());
      window.dispatchEvent(new Event('koperasi_balance_updated'));
    }

    // Add to transactions
    const savedTxsStr = localStorage.getItem('koperasi_transactions');
    let txList = [];
    if (savedTxsStr) {
      try {
        txList = JSON.parse(savedTxsStr);
      } catch (e) {
        console.error(e);
      }
    }

    const newTx = {
      id: `TX-ANG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      name: currentUserName,
      type: 'ANGSURAN',
      amount: amountNum,
      date: new Date().toISOString().split('T')[0],
      status: 'SUCCESS',
      note: `Bayar Angsuran Pinjaman`,
      method: paymentMethod
    };

    localStorage.setItem('koperasi_transactions', JSON.stringify([newTx, ...txList]));

    // Notify update
    window.dispatchEvent(new Event('koperasi_transactions_updated'));

    setPaySuccess(true);
    setTimeout(() => {
      setIsPayModalOpen(false);
      setPaySuccess(false);
      setPayAmount('');
    }, 2000);
  };

  const calculateStats = () => {
    // 1. Members
    const savedMembersStr = localStorage.getItem('coop_members');
    const membersCount = savedMembersStr ? JSON.parse(savedMembersStr).length : 4;
    const totalMembers = 1236 + membersCount;

    // 2. Transactions
    const savedTxsStr = localStorage.getItem('koperasi_transactions');
    const txList = savedTxsStr ? JSON.parse(savedTxsStr) : [
      { id: '1', name: 'Ahmad Fauzi', type: 'SIMPANAN', amount: 50000, date: '2026-05-17', status: 'SUCCESS' },
      { id: '2', name: 'Siti Aminah', type: 'PINJAMAN', amount: 200000, date: '2026-05-16', status: 'PENDING' },
      { id: '3', name: 'Budi Santoso', type: 'MART', amount: 12500, date: '2026-05-17', status: 'SUCCESS', note: 'Belanja: Roti & Teh' },
      { id: '4', name: 'Dewi Lestari', type: 'ANGSURAN', amount: 25000, date: '2026-05-15', status: 'SUCCESS' },
      { id: '5', name: 'Rizky Pratama', type: 'MART', amount: 8000, date: '2026-05-17', status: 'SUCCESS', note: 'Belanja: Susu UHT' },
    ];

    // Total Savings
    const simpananSum = txList
      .filter((t: any) => t.type === 'SIMPANAN' && t.status === 'SUCCESS')
      .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
    const totalSavingsVal = 45150000 + simpananSum;

    // Active Loans
    const savedLoansStr = localStorage.getItem('koperasi_loans');
    const loanList = savedLoansStr ? JSON.parse(savedLoansStr) : [
      { id: 'L1', name: 'Rizwan Kamil', amount: 500000, duration: '5 Bulan', purpose: 'Buku Pelajaran', status: 'PENDING' },
      { id: 'L2', name: 'Laila Sari', amount: 150000, duration: '2 Bulan', purpose: 'Seragam Olahraga', status: 'APPROVED' },
    ];
    const approvedLoansSum = loanList
      .filter((l: any) => l.status === 'APPROVED')
      .reduce((sum: number, l: any) => sum + Number(l.amount || 0), 0);
    const totalLoansVal = 8550000 + approvedLoansSum;

    // Mart Turnover
    const martSum = txList
      .filter((t: any) => t.type === 'MART' && t.status === 'SUCCESS')
      .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
    const totalMartVal = 12379500 + martSum;

    const formatValue = (val: number) => {
      const millions = val / 1000000;
      return `Rp ${millions.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}M`;
    };

    setStats({
      totalMembers: totalMembers.toLocaleString('id-ID'),
      totalSavings: formatValue(totalSavingsVal),
      activeLoans: formatValue(totalLoansVal),
      martRevenue: formatValue(totalMartVal),
    });

    // Calculate dynamic cashflow chart data
    const dayMap: { [key: number]: string } = {
      1: 'Sen',
      2: 'Sel',
      3: 'Rab',
      4: 'Kam',
      5: 'Jum',
      6: 'Sab',
      0: 'Min',
    };

    const defaultChartData = [
      { day: 'Sen', value: 1200000 },
      { day: 'Sel', value: 1800000 },
      { day: 'Rab', value: 1400000 },
      { day: 'Kam', value: 2100000 },
      { day: 'Jum', value: 2500000 },
      { day: 'Sab', value: 1300000 },
      { day: 'Min', value: 900000 },
    ];

    const additionsByDay: { [key: string]: number } = {
      'Sen': 0,
      'Sel': 0,
      'Rab': 0,
      'Kam': 0,
      'Jum': 0,
      'Sab': 0,
      'Min': 0,
    };

    txList.forEach((t: any) => {
      if ((t.status === 'SUCCESS' || t.status === 'COMPLETED') && t.date) {
        const d = new Date(t.date);
        const dayIndex = d.getDay();
        const dayName = dayMap[dayIndex];
        if (dayName && dayName in additionsByDay) {
          additionsByDay[dayName] += Number(t.amount || 0);
        }
      }
    });

    const updatedChart = defaultChartData.map(item => ({
      ...item,
      value: item.value + (additionsByDay[item.day] || 0)
    }));

    setChartData(updatedChart);
  };

  const loadPromoProducts = () => {
    const saved = localStorage.getItem('koperasi_products');
    let productList: any[] = [];
    if (saved) {
      try {
        productList = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved products', e);
      }
    }
    
    if (!productList || productList.length === 0) {
      productList = [
        { id: '1', name: 'Roti Coklat Lumer', price: 5000, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=400' },
        { id: '2', name: 'Air Mineral 600ml', price: 3000, image: 'https://images.unsplash.com/photo-1616118132261-dd52b5fb40f8?q=80&w=400' },
        { id: '3', name: 'Susu UHT Coklat', price: 6500, image: 'https://images.unsplash.com/photo-1563636619-e910f01ff1d5?q=80&w=400' },
        { id: '4', name: 'Pulpen Gel Hitam', price: 4000, image: 'https://images.unsplash.com/photo-1585336139118-24cc3f20ea31?q=80&w=400' }
      ];
    }
    // Limit to 4 items for the promo grid
    setPromoProducts(productList.slice(0, 4));
  };

  const loadUserData = () => {
    // 1. Get savings balance
    const savedBalance = localStorage.getItem('user_savings_balance');
    const balanceNum = savedBalance ? Number(savedBalance) : 2500000;
    setUserBalance(balanceNum);

    // 2. Get loans
    const currentUserName = localStorage.getItem('user_name') || 
      localStorage.getItem('user_email')?.split('@')[0].split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 
      'Ahmad Fauzi';

    const savedLoansStr = localStorage.getItem('koperasi_loans');
    let loanList: any[] = [];
    if (savedLoansStr) {
      try {
        loanList = JSON.parse(savedLoansStr);
      } catch (e) {
        console.error('Failed to parse loans', e);
      }
    }

    const myApprovedLoans = loanList.filter((l: any) => 
      String(l.name).toLowerCase() === currentUserName.toLowerCase() && 
      l.status === 'APPROVED'
    );

    let totalInstallment = 0;
    if (myApprovedLoans.length > 0) {
      myApprovedLoans.forEach((l: any) => {
        const durationMonths = parseInt(l.duration) || 1;
        const installment = Math.round(l.amount / durationMonths);
        totalInstallment += installment;
      });
    } else {
      totalInstallment = 120000; // default mock
    }

    // Dynamic bill subtraction
    const savedTxsStr = localStorage.getItem('koperasi_transactions');
    let txList: any[] = [];
    if (savedTxsStr) {
      try {
        txList = JSON.parse(savedTxsStr);
      } catch (e) {
        console.error('Failed to parse transactions', e);
      }
    }

    const currentMonth = new Date().toISOString().substring(0, 7); // e.g., "2026-05"
    const paidTxsThisMonth = txList.filter((t: any) => 
      String(t.name).toLowerCase() === currentUserName.toLowerCase() && 
      t.type === 'ANGSURAN' && 
      (t.status === 'SUCCESS' || t.status === 'COMPLETED') &&
      String(t.date).startsWith(currentMonth)
    );
    const paidThisMonthSum = paidTxsThisMonth.reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

    setUserLoanBill(Math.max(0, totalInstallment - paidThisMonthSum));
  };

  useEffect(() => {
    calculateStats();
    loadPromoProducts();
    loadUserData();

    // Event listeners to refresh results instantly when changes occur
    window.addEventListener('koperasi_transactions_updated', calculateStats);
    window.addEventListener('koperasi_transactions_updated', loadUserData);
    window.addEventListener('koperasi_loans_updated', calculateStats);
    window.addEventListener('koperasi_loans_updated', loadUserData);
    window.addEventListener('koperasi_members_updated', calculateStats);
    window.addEventListener('koperasi_orders_updated', calculateStats);
    window.addEventListener('koperasi_balance_updated', loadUserData);
    window.addEventListener('koperasi_products_updated', loadPromoProducts);
    window.addEventListener('storage', loadPromoProducts);
    window.addEventListener('storage', loadUserData);

    return () => {
      window.removeEventListener('koperasi_transactions_updated', calculateStats);
      window.removeEventListener('koperasi_transactions_updated', loadUserData);
      window.removeEventListener('koperasi_loans_updated', calculateStats);
      window.removeEventListener('koperasi_loans_updated', loadUserData);
      window.removeEventListener('koperasi_members_updated', calculateStats);
      window.removeEventListener('koperasi_orders_updated', calculateStats);
      window.removeEventListener('koperasi_balance_updated', loadUserData);
      window.removeEventListener('koperasi_products_updated', loadPromoProducts);
      window.removeEventListener('storage', loadPromoProducts);
      window.removeEventListener('storage', loadUserData);
    };
  }, []);

  if (role === 'ADMIN') {
    return (
      <div className="space-y-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Anggota', value: stats.totalMembers, change: '+24 bln ini', icon: <Users className="text-electric-blue" /> },
            { label: 'Total Simpanan', value: stats.totalSavings, change: '+12%', icon: <Wallet className="text-emerald-500" /> },
            { label: 'Pinjaman Aktif', value: stats.activeLoans, change: '-5.2%', icon: <TrendingUp className="text-amber-500" /> },
            { label: 'Omzet Mart', value: stats.martRevenue, change: '+18.4%', icon: <BarChart3 className="text-sky-blue" /> },
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm card-hover"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-slate-50 p-3 rounded-2xl">{stat.icon}</div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-black text-deep-blue mt-1">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-extrabold text-deep-blue">Arus Kas Pekan Ini</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Estimasi pendapatan harian</p>
              </div>
              <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-500 outline-none">
                <option>7 Hari Terakhir</option>
                <option>30 Hari Terakhir</option>
              </select>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#185ADB" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#185ADB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#185ADB" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-xl font-extrabold text-deep-blue mb-6">Aktivitas Terbaru</h3>
            <div className="space-y-6">
              {[
                { user: 'Budi Santoso', action: 'Setoran Simpanan', time: '5m lalu', amount: '+Rp 50rb', color: 'text-emerald-500' },
                { user: 'Siti Aminah', action: 'Belanja di Mart', time: '12m lalu', amount: '-Rp 15rb', color: 'text-rose-500' },
                { user: 'Ahmad Fauzi', action: 'Setoran Simpanan', time: '1j lalu', amount: '+Rp 100rb', color: 'text-emerald-500' },
                { user: 'Dewi Lestari', action: 'Penarikan Dana', time: '3j lalu', amount: '-Rp 200rb', color: 'text-rose-500' },
              ].map((act, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-blue transition-all">
                      {act.user[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-deep-blue">{act.user}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black">{act.action}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${act.color}`}>{act.amount}</p>
                    <p className="text-[10px] text-slate-400">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-1 md:col-span-2 bg-white p-10 rounded-[40px] border border-slate-100 shadow-2xl shadow-electric-blue/10 gradient-blue text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <p className="text-sky-blue font-black uppercase tracking-[0.2em] text-xs mb-3">Saldo Koperasi Anda</p>
          <h2 className="text-5xl font-black mb-8">Rp {userBalance.toLocaleString('id-ID')}</h2>
          
          <div className="flex flex-wrap gap-4">
            <Link to="/app/history" className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-8 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 border border-white/5">
              <History size={18} /> Detail Riwayat
            </Link>
            <Link to="/app/catalog" className="bg-sky-blue hover:bg-sky-400 px-8 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-sky-blue/20">
              <ShoppingBag size={18} /> Belanja Sekarang
            </Link>
          </div>
        </motion.div>
 
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
                <CreditCard size={18} />
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Tagihan Pinjaman</p>
            </div>
            <h3 className="text-3xl font-black text-rose-500">Rp {userLoanBill.toLocaleString('id-ID')}</h3>
            <p className="text-xs text-slate-400 mt-2 font-medium bg-slate-50 w-fit px-2 py-1 rounded-lg">Jatuh tempo: 15 Mei 2026</p>
          </div>
          {userLoanBill <= 0 ? (
            <button className="mt-8 w-full py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-sm cursor-not-allowed border border-emerald-100" disabled>
              Tagihan Lunas ✨
            </button>
          ) : (
            <button 
              onClick={() => {
                setPayAmount(userLoanBill.toString());
                setIsPayModalOpen(true);
              }}
              className="mt-8 w-full py-4 bg-deep-blue text-white rounded-2xl font-black text-sm hover:bg-black transition-all shadow-xl shadow-deep-blue/10"
            >
              Bayar Tagihan
            </button>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-extrabold text-deep-blue">Koperasi Mart</h3>
            <Link to="/app/catalog" className="text-sky-blue font-bold text-xs hover:underline flex items-center gap-1">Lihat Katalog <ChevronRight size={14}/></Link>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {promoProducts.map((prod, i) => (
              <div key={prod.id || i} className="group cursor-pointer flex gap-4 items-center p-2 rounded-2xl hover:bg-slate-50 transition-all">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex-shrink-0 overflow-hidden relative border border-slate-100/50 flex items-center justify-center">
                  {prod.image ? (
                    <img 
                      src={prod.image} 
                      alt={prod.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  ) : (
                    <Package className="absolute inset-0 m-auto text-slate-300 group-hover:text-sky-blue transition-colors" size={24} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-deep-blue text-sm truncate" title={prod.name}>{prod.name}</h4>
                  <p className="text-sky-blue font-black text-xs mt-0.5">
                    Rp {Number(prod.price || 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-xl font-extrabold text-deep-blue mb-8">Info & Pengumuman</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100">
              <p className="text-xs font-black text-sky-600 uppercase mb-1">Rapat Tahunan</p>
              <p className="text-sm font-bold text-deep-blue">RAT Koperasi Siswa akan dilaksanakan pada Sabtu, 10 Mei 2026 di Aula Sekolah.</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
              <p className="text-xs font-black text-amber-600 uppercase mb-1">Pemanfaatan Saldo</p>
              <p className="text-sm font-bold text-deep-blue">Sekarang saldo koperasi bisa digunakan untuk membayar iuran OSIS secara digital.</p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isPayModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !paySuccess && setIsPayModalOpen(false)}
              className="absolute inset-0 bg-deep-blue/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden relative z-10"
            >
              {paySuccess ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 flex-col">
                    <CheckCircle className="text-emerald-500" size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-deep-blue mb-2">Pembayaran Berhasil!</h3>
                  <p className="text-slate-500 text-sm">Angsuran Anda sebesar <strong>Rp {Number(payAmount).toLocaleString('id-ID')}</strong> berhasil dibayarkan.</p>
                </div>
              ) : (
                <>
                  <div className="p-8 gradient-blue text-white flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black">Bayar Angsuran</h3>
                      <p className="text-xs text-white/80 mt-1">Pembayaran tagihan pinjaman secara instan</p>
                    </div>
                    <button onClick={() => setIsPayModalOpen(false)} className="text-white hover:text-slate-200 transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  <form onSubmit={handlePayBill} className="p-8 space-y-6">
                    {paymentError && (
                      <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-bold leading-relaxed border border-rose-100 flex items-start gap-2">
                        <AlertCircle className="flex-shrink-0 mt-0.5" size={14} />
                        <span>{paymentError}</span>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Tagihan Aktif</label>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-2xl font-black text-deep-blue">Rp {userLoanBill.toLocaleString('id-ID')}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Jatuh Tempo: 15 Mei 2026</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nominal Pembayaran</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                        <input 
                          required
                          type="number"
                          value={payAmount}
                          max={userLoanBill}
                          onChange={(e) => setPayAmount(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-sky-blue/10 focus:border-sky-blue outline-none transition-all font-bold"
                          placeholder="0"
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button 
                          type="button"
                          onClick={() => setPayAmount(userLoanBill.toString())}
                          className="text-[10px] font-black text-sky-blue hover:underline uppercase tracking-wide"
                        >
                          Bayar Penuh
                        </button>
                        {userLoanBill > 50000 && (
                          <>
                            <span className="text-slate-300 text-xs">•</span>
                            <button 
                              type="button"
                              onClick={() => setPayAmount((userLoanBill / 2).toString())}
                              className="text-[10px] font-black text-sky-blue hover:underline uppercase tracking-wide"
                            >
                              Bayar Setengah
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Metode Pembayaran</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('SALDO')}
                          className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between h-24 ${
                            paymentMethod === 'SALDO' 
                              ? 'border-sky-blue bg-sky-50/20 ring-4 ring-sky-blue/10' 
                              : 'border-slate-100 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <Wallet size={18} className={paymentMethod === 'SALDO' ? 'text-sky-blue' : 'text-slate-400'} />
                          <div>
                            <p className="text-xs font-black text-deep-blue">Saldo Koperasi</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Sisa: Rp {userBalance.toLocaleString('id-ID')}</p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('TUNAI')}
                          className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between h-24 ${
                            paymentMethod === 'TUNAI' 
                              ? 'border-sky-blue bg-sky-50/20 ring-4 ring-sky-blue/10' 
                              : 'border-slate-100 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <CreditCard size={18} className={paymentMethod === 'TUNAI' ? 'text-sky-blue' : 'text-slate-400'} />
                          <div>
                            <p className="text-xs font-black text-deep-blue">Tunai / Cash</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Bayar di Kasir/Admin</p>
                          </div>
                        </button>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-5 bg-sky-blue hover:bg-sky-400 text-white rounded-2xl font-black shadow-lg shadow-sky-blue/20 transition-all flex items-center justify-center gap-2"
                    >
                      Konfirmasi Pembayaran
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/app/*" element={<AppLayout />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
