import React, { useState, useEffect } from 'react';
import { 
  Wallet, TrendingUp, HandCoins, ArrowUpCircle, 
  ArrowDownCircle, Plus, Search, Filter,
  CheckCircle2, XCircle, Clock, MoreVertical,
  X, Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Mock Data
const simulationMembers = [
  'Ahmad Fauzi',
  'Siti Aminah',
  'Budi Santoso',
  'Dewi Lestari',
  'Rizky Pratama',
  'Indah Permata'
];

const initialTransactions = [
  { id: '1', name: 'Ahmad Fauzi', type: 'SIMPANAN', amount: 50000, date: '2026-05-17', status: 'SUCCESS' },
  { id: '2', name: 'Siti Aminah', type: 'PINJAMAN', amount: 200000, date: '2026-05-16', status: 'PENDING' },
  { id: '3', name: 'Budi Santoso', type: 'MART', amount: 12500, date: '2026-05-17', status: 'SUCCESS', note: 'Belanja: Roti & Teh' },
  { id: '4', name: 'Dewi Lestari', type: 'ANGSURAN', amount: 25000, date: '2026-05-15', status: 'SUCCESS' },
  { id: '5', name: 'Rizky Pratama', type: 'MART', amount: 8000, date: '2026-05-17', status: 'SUCCESS', note: 'Belanja: Susu UHT' },
];

const mockLoans = [
  { id: 'L1', name: 'Rizwan Kamil', amount: 500000, duration: '5 Bulan', purpose: 'Buku Pelajaran', status: 'PENDING' },
  { id: 'L2', name: 'Laila Sari', amount: 150000, duration: '2 Bulan', purpose: 'Seragam Olahraga', status: 'APPROVED' },
];

export default function FinancePage() {
  const userRole = localStorage.getItem('user_role') || 'ANGGOTA';
  const [activeTab, setActiveTab] = useState<'TRANSAKSI' | 'PINJAMAN'>('TRANSAKSI');
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('koperasi_transactions');
    const data = saved ? JSON.parse(saved) : initialTransactions;
    
    // Clean up "polluted" data where generic names were used
    return data.map((t: any) => {
      const isGeneric = !t.name || 
                        t.name.startsWith('Belanja Mart:') || 
                        t.name === 'Anggota Koperasi' || 
                        t.name === 'Anggota Umum' || 
                        t.name === 'Pilih Anggota...';
      
      if (isGeneric) {
        const randomName = simulationMembers[Math.floor(Math.random() * simulationMembers.length)];
        return {
          ...t,
          name: randomName,
          note: t.note || (t.name?.startsWith('Belanja Mart:') ? t.name : undefined)
        };
      }
      return t;
    });
  });
  const [loans, setLoans] = useState(() => {
    const saved = localStorage.getItem('koperasi_loans');
    const parsed = saved ? JSON.parse(saved) : [];
    // If it's an admin view and we have NO loans at all, show mock loans
    if (parsed.length === 0 && !saved) {
      return mockLoans;
    }
    return parsed;
  });

  useEffect(() => {
    const currentSaved = localStorage.getItem('koperasi_transactions');
    const currentData = JSON.stringify(transactions);
    if (currentSaved !== currentData) {
      localStorage.setItem('koperasi_transactions', currentData);
      window.dispatchEvent(new Event('koperasi_transactions_updated'));
    }
  }, [transactions]);

  useEffect(() => {
    const currentSaved = localStorage.getItem('koperasi_loans');
    const currentData = JSON.stringify(loans);
    if (currentSaved !== currentData) {
      localStorage.setItem('koperasi_loans', currentData);
      window.dispatchEvent(new Event('koperasi_loans_updated'));
    }
  }, [loans]);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedLoans = localStorage.getItem('koperasi_loans');
      if (savedLoans) {
        setLoans(prev => {
          if (JSON.stringify(prev) === savedLoans) return prev;
          return JSON.parse(savedLoans);
        });
      }
      
      const savedTxs = localStorage.getItem('koperasi_transactions');
      if (savedTxs) {
        setTransactions(prev => {
          if (JSON.stringify(prev) === savedTxs) return prev;
          return JSON.parse(savedTxs);
        });
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('koperasi_loans_updated', handleStorageChange);
    window.addEventListener('koperasi_transactions_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('koperasi_loans_updated', handleStorageChange);
      window.removeEventListener('koperasi_transactions_updated', handleStorageChange);
    };
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // User-specific names and data
  const currentUserName = localStorage.getItem('user_name') || 
    localStorage.getItem('user_email')?.split('@')[0].split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 
    'Ahmad Fauzi';

  const [userStats, setUserStats] = useState(() => {
    const savedBalance = localStorage.getItem('user_savings_balance');
    const allLoans = JSON.parse(localStorage.getItem('koperasi_loans') || '[]');
    const currentUserName = localStorage.getItem('user_name') || 
      localStorage.getItem('user_email')?.split('@')[0].split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 
      'Ahmad Fauzi';
    
    const myApprovedLoans = allLoans.filter((l: any) => 
      String(l.name).toLowerCase() === currentUserName.toLowerCase() && 
      l.status === 'APPROVED'
    );
    
    const activeLoanAmount = myApprovedLoans.reduce((sum: number, l: any) => sum + l.amount, 0);
    
    return {
      totalSavings: savedBalance ? Number(savedBalance) : 2500000,
      activeLoan: activeLoanAmount || 1200000,
      monthlyInterest: activeLoanAmount ? Math.floor(activeLoanAmount * 0.01) : 12500
    };
  });

  const memberTransactions = transactions.filter(t => 
    t.name.toLowerCase() === currentUserName.toLowerCase()
  );

  useEffect(() => {
    const syncFinance = () => {
      const savedBalance = localStorage.getItem('user_savings_balance');
      const allLoans = JSON.parse(localStorage.getItem('koperasi_loans') || '[]');
      
      const myApprovedLoans = allLoans.filter((l: any) => 
        String(l.name).toLowerCase() === currentUserName.toLowerCase() && 
        l.status === 'APPROVED'
      );
      
      const activeLoanAmount = myApprovedLoans.reduce((sum: number, l: any) => sum + l.amount, 0);

      setUserStats(prev => ({ 
        ...prev, 
        totalSavings: savedBalance ? Number(savedBalance) : prev.totalSavings,
        activeLoan: activeLoanAmount || prev.activeLoan,
        monthlyInterest: activeLoanAmount ? Math.floor(activeLoanAmount * 0.01) : prev.monthlyInterest
      }));
    };
    window.addEventListener('koperasi_balance_updated', syncFinance);
    window.addEventListener('koperasi_loans_updated', syncFinance);
    window.addEventListener('storage', syncFinance);
    return () => {
      window.removeEventListener('koperasi_balance_updated', syncFinance);
      window.removeEventListener('koperasi_loans_updated', syncFinance);
      window.removeEventListener('storage', syncFinance);
    };
  }, [currentUserName]);

  // Form State
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('SIMPANAN');
  const [newAmount, setNewAmount] = useState('');

  const handleLoanDelete = (id: string) => {
    setDeleteConfirmId(`LOAN-${id}`);
  };

  const handleLoanStatus = (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    console.log('Update loan status:', id, newStatus);
    const loanIdStr = String(id);
    const loanToUpdate = loans.find(l => String(l.id) === loanIdStr);
    if (!loanToUpdate) {
      console.error('Loan not found:', id);
      return;
    }

    setLoans(prev => prev.map(loan => 
      String(loan.id) === loanIdStr ? { ...loan, status: newStatus } : loan
    ));

    // If approved, create a transaction record
    if (newStatus === 'APPROVED') {
      const newTx = {
        id: `TX-LOAN-${id}`,
        name: loanToUpdate.name,
        type: 'PINJAMAN',
        amount: loanToUpdate.amount,
        date: new Date().toISOString().split('T')[0],
        status: 'SUCCESS',
        note: `Pinjaman: ${loanToUpdate.purpose}`
      };
      setTransactions(prev => [newTx, ...prev]);

      // If it's for the current user, update their balance (simulate payout)
      const currentUserName = localStorage.getItem('user_name') || localStorage.getItem('user_email')?.split('@')[0];
      if (loanToUpdate.name === currentUserName) {
        const currentBalance = Number(localStorage.getItem('user_savings_balance') || '2500000');
        const newBalance = currentBalance + loanToUpdate.amount;
        localStorage.setItem('user_savings_balance', newBalance.toString());
        window.dispatchEvent(new Event('koperasi_balance_updated'));
      }
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setDeleteConfirmId(`TX-${id}`);
  };

  const confirmDelete = () => {
    if (!deleteConfirmId) return;

    if (deleteConfirmId.startsWith('LOAN-')) {
      const loanId = deleteConfirmId.slice(5);
      setLoans(prev => prev.filter(l => String(l.id) !== String(loanId)));
    } else if (deleteConfirmId.startsWith('TX-')) {
      const txId = deleteConfirmId.slice(3);
      setTransactions(prev => prev.filter(t => String(t.id) !== String(txId)));
    } else {
      // Fallback
      setTransactions(prev => prev.filter(t => String(t.id) !== String(deleteConfirmId)));
    }
    setDeleteConfirmId(null);
  };

  const handleApproveTransaction = (id: string) => {
    const txToApprove = transactions.find(t => String(t.id) === String(id));
    
    setTransactions(prev => prev.map(t => 
      String(t.id) === String(id) ? { ...t, status: 'SUCCESS' } : t
    ));

    // Update balance on approval if it's a relevant type
    if (txToApprove && txToApprove.status !== 'SUCCESS') {
      const savedBalance = localStorage.getItem('user_savings_balance');
      let currentBalance = savedBalance ? Number(savedBalance) : 2500000;
      
      // If the transaction belongs to a known user (simulate logic)
      // For mock, we check if name matches current user or if it's from a member
      if (txToApprove.type === 'SIMPANAN') currentBalance += txToApprove.amount;
      else if (txToApprove.type === 'PINJAMAN') currentBalance += txToApprove.amount;
      else if (txToApprove.type === 'ANGSURAN') currentBalance -= txToApprove.amount;

      localStorage.setItem('user_savings_balance', currentBalance.toString());
      window.dispatchEvent(new Event('koperasi_balance_updated'));
    }
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newAmount) return;

    const newTx = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      type: newType as any,
      amount: Number(newAmount),
      date: new Date().toISOString().split('T')[0],
      status: userRole === 'ADMIN' ? 'SUCCESS' : 'PENDING', // Auto-success for admin
      note: newType === 'ANGSURAN' ? 'Cicilan Pinjaman' : (newType === 'SIMPANAN' ? 'Setoran Tabungan' : 'Pinjaman')
    };

    setTransactions([newTx, ...transactions]);
    
    // If Admin adds successful transaction, update balance immediately
    if (userRole === 'ADMIN') {
      // In a real app, we'd lookup the member's balance. 
      // For this mock, if the name matches current user simulation:
      const savedBalance = localStorage.getItem('user_savings_balance');
      const currentBalance = savedBalance ? Number(savedBalance) : 2500000;
      let newBalance = currentBalance;
      
      if (newType === 'SIMPANAN') newBalance += Number(newAmount);
      else if (newType === 'PINJAMAN') newBalance += Number(newAmount);
      else if (newType === 'ANGSURAN') newBalance -= Number(newAmount);
      
      localStorage.setItem('user_savings_balance', newBalance.toString());
      window.dispatchEvent(new Event('koperasi_balance_updated'));
    }

    setIsModalOpen(false);
    
    // Reset
    setNewName(''); setNewAmount('');
  };

  const filteredTransactions = transactions.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {userRole === 'ANGGOTA' ? (
        <div className="space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-black text-deep-blue">Halo, {currentUserName}</h2>
              <p className="text-slate-500 font-medium">Selamat datang di portal keuangan Anda.</p>
            </div>
            <button 
              onClick={() => {
                setNewName(currentUserName);
                setIsModalOpen(true);
              }}
              className="gradient-blue text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:scale-105 active:scale-95 shadow-xl shadow-electric-blue/20 transition-all"
            >
              <Plus size={20} /> Setor / Bayar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-emerald-200 transition-all">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wallet size={32} />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Tabungan</p>
                <h3 className="text-3xl font-black text-deep-blue">Rp {userStats.totalSavings.toLocaleString('id-ID')}</h3>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-rose-200 transition-all">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <HandCoins size={32} />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Saldo Pinjaman</p>
                <h3 className="text-3xl font-black text-deep-blue">Rp {userStats.activeLoan.toLocaleString('id-ID')}</h3>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-amber-200 transition-all">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock size={32} />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Menunggu Konfirmasi</p>
                <h3 className="text-3xl font-black text-amber-600">
                  {memberTransactions.filter(t => t.status === 'PENDING').length > 0 
                    ? `Rp ${memberTransactions.filter(t => t.status === 'PENDING').reduce((sum, t) => sum + t.amount, 0).toLocaleString('id-ID')}` 
                    : 'Rp 0'}
                </h3>
                {memberTransactions.filter(t => t.status === 'PENDING').length > 0 && 
                  <p className="text-[10px] text-amber-400 font-bold italic">{memberTransactions.filter(t => t.status === 'PENDING').length} transaksi pending</p>}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-deep-blue">Riwayat Keuangan Saya</h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider">Tersimpan</span>
                <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold uppercase tracking-wider">Pending</span>
              </div>
            </div>
            <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
              {memberTransactions.length > 0 ? (
                <div className="grid grid-cols-1 divide-y divide-slate-50">
                  {memberTransactions.map((t) => (
                    <div key={t.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
                          String(t.status).toUpperCase() === 'PENDING' ? 'bg-slate-100 text-slate-400' :
                          t.type === 'SIMPANAN' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
                        }`}>
                          {String(t.status).toUpperCase() === 'PENDING' ? <Clock size={28} /> :
                           t.type === 'SIMPANAN' ? <Plus size={28} /> : <ArrowDownCircle size={28} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-base font-black text-deep-blue">{t.note || (t.type === 'SIMPANAN' ? 'Setoran Tabungan' : 'Angsuran')}</p>
                            {String(t.status).toUpperCase() === 'PENDING' && (
                              <span className="text-[9px] font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full uppercase">Review</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-black ${
                          String(t.status).toUpperCase() === 'PENDING' ? 'text-slate-400' :
                          t.type === 'SIMPANAN' ? 'text-emerald-500' : 'text-rose-500'
                        }`}>
                          {t.type === 'SIMPANAN' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                        </p>
                        <p className={`text-[10px] font-extrabold uppercase tracking-widest ${
                          String(t.status).toUpperCase() === 'SUCCESS' ? 'text-emerald-500' : 'text-amber-500'
                        }`}>
                          {String(t.status).toUpperCase() === 'SUCCESS' ? 'Diterima' : 'Sedang Ditinjau'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-20 text-center text-slate-400">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock className="opacity-20" size={40} />
                  </div>
                  <p className="font-bold text-lg text-slate-300">Belum ada transaksi</p>
                  <p className="text-sm">Klik tombol "Setor / Bayar" untuk mulai menabung.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                <ArrowUpCircle size={28} />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Simpanan</p>
                <h3 className="text-2xl font-black text-deep-blue">Rp 45.240.000</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                <ArrowDownCircle size={28} />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pinjaman Beredar</p>
                <h3 className="text-2xl font-black text-deep-blue">Rp 8.750.000</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 bg-sky-50 text-sky-blue rounded-2xl flex items-center justify-center">
                <TrendingUp size={28} />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Cash on Hand</p>
                <h3 className="text-2xl font-black text-deep-blue">Rp 36.490.000</h3>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Tabs Control */}
            <div className="flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-slate-100 gap-4">
              <div className="flex bg-slate-50 p-1.5 rounded-2xl w-fit">
                <button 
                  onClick={() => setActiveTab('TRANSAKSI')}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    activeTab === 'TRANSAKSI' ? 'bg-white text-deep-blue shadow-sm' : 'text-slate-400'
                  }`}
                >
                  Log Transaksi
                </button>
                <button 
                  onClick={() => setActiveTab('PINJAMAN')}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    activeTab === 'PINJAMAN' ? 'bg-white text-deep-blue shadow-sm' : 'text-slate-400'
                  }`}
                >
                  Permohonan Pinjaman
                </button>
              </div>

              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Cari anggota..."
                    className="pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-sky-blue text-sm transition-all w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="gradient-blue text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-[1.02] shadow-lg shadow-electric-blue/20 transition-all"
                >
                  <Plus size={18} /> Input Baru
                </button>
              </div>
            </div>

            {/* Content Lists */}
            <div className="overflow-x-auto">
              {activeTab === 'TRANSAKSI' ? (
                <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 sticky top-0 z-10">
                    <tr>
                      <th className="px-8 py-5">Nama Anggota</th>
                      <th className="px-8 py-5">Kategori</th>
                      <th className="px-8 py-5">Nominal</th>
                      <th className="px-8 py-5">Tanggal</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-xs uppercase">
                              {(t.name || 'A')[0]}
                            </div>
                            <span className="font-bold text-deep-blue">
                              {t.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                            t.type === 'SIMPANAN' ? 'bg-emerald-100 text-emerald-600' : 
                            t.type === 'PINJAMAN' ? 'bg-rose-100 text-rose-600' : 
                            t.type === 'MART' ? 'bg-amber-100 text-amber-600' :
                            'bg-sky-100 text-sky-600'
                          }`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="px-8 py-5 font-black text-deep-blue">
                          Rp {t.amount.toLocaleString()}
                        </td>
                        <td className="px-8 py-5 text-sm text-slate-500">
                          {t.date}
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            {(String(t.status).toUpperCase() === 'SUCCESS' || String(t.status).toUpperCase() === 'COMPLETED') ? (
                              <CheckCircle2 size={16} className="text-emerald-500" />
                            ) : (
                              <Clock size={16} className="text-amber-500" />
                            )}
                            <span className={`text-[10px] font-black uppercase ${(String(t.status).toUpperCase() === 'SUCCESS' || String(t.status).toUpperCase() === 'COMPLETED') ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {(String(t.status).toUpperCase() === 'SUCCESS' || String(t.status).toUpperCase() === 'COMPLETED') ? 'SUCCESS' : 'PENDING'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2 relative z-20">
                            {!(String(t.status).toUpperCase() === 'SUCCESS' || String(t.status).toUpperCase() === 'COMPLETED') && (
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApproveTransaction(t.id);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-xl font-bold text-[10px] uppercase hover:bg-emerald-600 transition-all cursor-pointer shadow-sm active:scale-95"
                              >
                                <CheckCircle2 size={14} /> Setujui
                              </button>
                            )}
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTransaction(t.id);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 text-white rounded-xl font-bold text-[10px] uppercase hover:bg-rose-600 transition-all cursor-pointer shadow-sm active:scale-95"
                            >
                              <XCircle size={14} /> Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {loans.map((loan) => (
                    <div key={loan.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-deep-blue shadow-sm">
                            <HandCoins size={24} />
                          </div>
                          <div>
                            <h4 className="font-black text-deep-blue leading-none">{loan.name}</h4>
                            <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">{loan.duration}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          String(loan.status || '').toUpperCase() === 'PENDING' ? 'bg-amber-100 text-amber-600' : 
                          String(loan.status || '').toUpperCase() === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                        }`}>
                          {String(loan.status || '').toUpperCase() === 'APPROVED' ? 'Disetujui' : String(loan.status || '').toUpperCase() === 'REJECTED' ? 'Ditolak' : 'Menunggu'}
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Tujuan</span>
                          <span className="text-deep-blue font-bold">{loan.purpose}</span>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-slate-500 text-sm">Nominal Pinjaman</span>
                          <span className="text-2xl font-black text-rose-500">Rp {loan.amount.toLocaleString()}</span>
                        </div>
                      </div>

                      {!(String(loan.status || '').toUpperCase() === 'APPROVED' || String(loan.status || '').toUpperCase() === 'REJECTED') ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLoanStatus(loan.id, 'APPROVED');
                            }}
                            className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-200 active:scale-95 cursor-pointer"
                          >
                            <CheckCircle2 size={16} /> Setujui
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLoanStatus(loan.id, 'REJECTED');
                            }}
                            className="flex-1 bg-white text-rose-500 border-2 border-rose-100 hover:bg-rose-50 py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                          >
                            <XCircle size={16} /> Tolak
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLoanDelete(loan.id);
                            }}
                            className="flex-none px-4 bg-rose-100 text-rose-600 rounded-xl transition-all flex items-center justify-center active:scale-95 cursor-pointer font-bold text-xs gap-1"
                            title="Hapus Permohonan"
                          >
                            <X size={16} /> Hapus
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <div className={`flex-1 py-3 rounded-xl font-bold text-sm text-center border ${
                            String(loan.status || '').toUpperCase() === 'APPROVED' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'
                          }`}>
                            Permohonan telah diproses
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLoanDelete(loan.id);
                            }}
                            className="flex-none px-4 bg-rose-50 text-rose-400 hover:text-rose-600 rounded-xl transition-all flex items-center justify-center active:scale-95 cursor-pointer font-bold text-xs gap-1"
                          >
                            <XCircle size={16} /> Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="absolute inset-0 bg-deep-blue/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden relative z-10 p-8 text-center"
            >
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <XCircle size={48} />
              </div>
              <h3 className="text-2xl font-black text-deep-blue mb-2">Hapus Data Ini?</h3>
              <p className="text-slate-500 mb-8 font-medium">Data yang dihapus tidak dapat dikembalikan.</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-4 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-4 rounded-2xl font-bold bg-rose-500 text-white shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Input Baru */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-deep-blue/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-6 gradient-blue text-white flex items-center justify-between">
                <h3 className="text-xl font-bold">Input Transaksi Keuangan</h3>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)} 
                  className="p-2 hover:bg-white/10 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddTransaction} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Nama Anggota</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Masukkan nama Anda..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-sky-blue transition-all"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Jenis Transaksi</label>
                      <select 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-sky-blue"
                        value={newType}
                        onChange={(e) => setNewType(e.target.value)}
                      >
                        <option value="SIMPANAN">Simpanan</option>
                        <option value="PINJAMAN">Pinjaman</option>
                        <option value="ANGSURAN">Angsuran</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Nominal (Rp)</label>
                      <input 
                        type="number" 
                        required
                        placeholder="0"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-blue outline-none transition-all"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="flex-3 px-6 py-4 rounded-2xl font-bold gradient-blue text-white shadow-lg shadow-electric-blue/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Save size={20} /> Simpan Transaksi
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
