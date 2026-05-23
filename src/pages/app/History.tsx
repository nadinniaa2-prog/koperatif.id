import React, { useState, useEffect } from 'react';
import { 
  History as HistoryIcon, Search, Filter, 
  ArrowUpCircle, ArrowDownCircle, ShoppingBag,
  Download, Calendar, MoreVertical, CreditCard,
  ShoppingBasket, CheckCircle2, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Mock initial data
const initialHistory = [
  { id: 'TX-1001', type: 'MART', name: 'Ahmad Fauzi', amount: 15000, date: '2026-05-17 08:30', status: 'SUCCESS', method: 'SALDO', note: 'Belanja Kantin (Buku, Susu)' },
  { id: 'TX-1002', type: 'SIMPANAN', name: 'Siti Aminah', amount: 10000, date: '2026-05-16 09:15', status: 'SUCCESS', method: 'TUNAI', note: 'Setoran Wajib Mei' },
  { id: 'TX-1003', type: 'ANGSURAN', name: 'Budi Santoso', amount: 150000, date: '2026-05-15 14:20', status: 'SUCCESS', method: 'SALDO', note: 'Cicilan Laptop #3' },
  { id: 'TX-1004', type: 'MART', name: 'Dewi Lestari', amount: 8500, date: '2026-05-17 10:00', status: 'SUCCESS', method: 'SALDO', note: 'Alat Tulis & Camilan' },
];

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('ALL');
  const [isDateOpen, setIsDateOpen] = useState(false);

  const categoryLabels: { [key: string]: string } = {
    ALL: 'Semua Kategori',
    SIMPANAN: 'Simpanan',
    PINJAMAN: 'Pinjaman',
    ANGSURAN: 'Angsuran',
    MART: 'Belanja Mart',
  };

  const dateLabels: { [key: string]: string } = {
    ALL: 'Semua Waktu',
    7: '7 Hari Terakhir',
    30: '30 Hari Terakhir',
    90: '90 Hari Terakhir',
  };

  const currentUserName = localStorage.getItem('user_name') || 
    localStorage.getItem('user_email')?.split('@')[0].split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 
    'Ahmad Fauzi';

  const loadHistoryData = () => {
    const userRole = localStorage.getItem('user_role') || 'ANGGOTA';
    const savedTransactions = localStorage.getItem('koperasi_transactions');
    let transactionsPool: any[] = [];

    if (savedTransactions) {
      try {
        transactionsPool = JSON.parse(savedTransactions);
      } catch (e) {
        console.error('Failed to parse koperasi_transactions', e);
        transactionsPool = [...initialHistory];
      }
    } else {
      transactionsPool = [...initialHistory];
    }

    // Filter transactions: Anggota should only see their own transactions; Admin sees everything
    let filteredPool = [...transactionsPool];
    if (userRole === 'ANGGOTA') {
      filteredPool = filteredPool.filter(t => 
        (t.name && String(t.name).toLowerCase() === currentUserName.toLowerCase())
      );
    }

    // Sort by date descending
    const sorted = filteredPool.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });

    setHistory(sorted);
  };

  useEffect(() => {
    loadHistoryData();

    // Event listeners to refresh results instantly when changes occur
    window.addEventListener('koperasi_transactions_updated', loadHistoryData);
    window.addEventListener('storage', loadHistoryData);

    return () => {
      window.removeEventListener('koperasi_transactions_updated', loadHistoryData);
      window.removeEventListener('storage', loadHistoryData);
    };
  }, [currentUserName]);

  const handleDownload = () => {
    if (history.length === 0) return;
    
    const headers = ['ID', 'Tipe', 'Nama Anggota', 'Aktivitas / Item', 'Nominal', 'Tanggal', 'Status', 'Metode Pembayaran'];
    const csvRows = history.map(item => {
      const displayDesc = item.note || (item.type === 'SIMPANAN' ? 'Setor Simpanan' : item.type === 'PINJAMAN' ? 'Pencairan Pinjaman' : item.type === 'ANGSURAN' ? 'Pembayaran Angsuran' : 'Belanja Mart');
      return [
        item.id,
        item.type,
        `"${String(item.name || '').replace(/"/g, '""')}"`,
        `"${String(displayDesc || '').replace(/"/g, '""')}"`,
        item.amount,
        item.date,
        item.status,
        item.method || (item.type === 'MART' ? 'SALDO' : 'TUNAI')
      ].join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rekap_transaksi_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const filteredHistory = history.filter(h => {
    // Category filter
    if (selectedCategory !== 'ALL' && h.type !== selectedCategory) {
      return false;
    }

    // Date range filter
    if (selectedDateRange !== 'ALL' && h.date) {
      const daysLimit = parseInt(selectedDateRange, 10);
      const txDate = new Date(h.date.split(' ')[0]);
      const now = new Date();
      // Zero out time for clean comparisons
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const targetDate = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());
      const diffTime = today.getTime() - targetDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > daysLimit) {
        return false;
      }
    }

    const desc = h.note || (h.type === 'SIMPANAN' ? 'Setor Simpanan' : h.type === 'PINJAMAN' ? 'Pencairan Pinjaman' : h.type === 'ANGSURAN' ? 'Pembayaran Angsuran' : 'Belanja Mart');
    return (
      desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(h.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(h.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-deep-blue">Riwayat Transaksi</h2>
          <p className="text-slate-500">Semua aktivitas keuangan dan belanja Anda terekam di sini.</p>
        </div>
        <button 
          onClick={handleDownload}
          className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
        >
          <Download size={18} /> Unduh Rekap (.CSV)
        </button>
      </div>

      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari ID transaksi atau nama..." 
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-sky-blue transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {/* Filter Hari / Tanggal */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsDateOpen(!isDateOpen);
                  setIsCategoryOpen(false);
                }}
                className="bg-slate-50 text-slate-600 px-4 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-slate-100 transition-all border border-slate-100 active:scale-95"
              >
                <Calendar size={18} className="text-slate-400" /> 
                <span>{dateLabels[selectedDateRange]}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isDateOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDateOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsDateOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 py-2 overflow-hidden"
                    >
                      {Object.keys(dateLabels).map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setSelectedDateRange(key);
                            setIsDateOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all ${
                            selectedDateRange === key 
                              ? 'bg-deep-blue text-white' 
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {dateLabels[key]}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Filter Kategori */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsCategoryOpen(!isCategoryOpen);
                  setIsDateOpen(false);
                }}
                className="bg-slate-900 text-white px-4 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-black transition-all active:scale-95 shadow-md shadow-slate-950/10"
              >
                <Filter size={18} className="text-white/80" /> 
                <span>{categoryLabels[selectedCategory]}</span>
                <ChevronDown size={14} className={`text-white/70 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isCategoryOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsCategoryOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 py-2 overflow-hidden"
                    >
                      {Object.keys(categoryLabels).map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(key);
                            setIsCategoryOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all ${
                            selectedCategory === key 
                              ? 'bg-deep-blue text-white' 
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {categoryLabels[key]}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="px-6 py-4">Status & Tanggal</th>
                <th className="px-6 py-4">Aktivitas / Item</th>
                <th className="px-6 py-4">Metode</th>
                <th className="px-6 py-4">Nominal</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence>
                {filteredHistory.map((item) => (
                  <motion.tr 
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/50 transition-all group"
                  >
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-emerald-500 mb-1 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Selesai
                        </span>
                        <span className="text-xs font-bold text-slate-400">{item.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          item.type === 'MART' ? 'bg-sky-50 text-sky-600' : 
                          item.type === 'SIMPANAN' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {item.type === 'MART' ? <ShoppingBag size={20} /> : 
                           item.type === 'SIMPANAN' ? <ArrowUpCircle size={20} /> : <CreditCard size={20} />}
                        </div>
                        <div>
                          <p className="font-extrabold text-deep-blue text-sm">
                            {item.note || (item.type === 'SIMPANAN' ? 'Setor Simpanan Koperasi' : item.type === 'PINJAMAN' ? 'Pencairan Pinjaman' : item.type === 'ANGSURAN' ? 'Pembayaran Angsuran' : 'Belanja Mart')}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                            <span>{item.id}</span>
                            <span className="text-slate-300">•</span>
                            <span>{item.name}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase">
                        {item.method || (item.type === 'MART' ? 'SALDO' : 'TUNAI')}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`text-sm font-black ${
                        item.type === 'SIMPANAN' ? 'text-emerald-500' : 'text-deep-blue'
                      }`}>
                        {item.type === 'SIMPANAN' ? '+' : '-'} Rp {item.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <button className="p-2 text-slate-300 hover:text-deep-blue opacity-0 group-hover:opacity-100 transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredHistory.length === 0 && (
            <div className="py-20 text-center text-slate-400 font-bold italic">
              Belum ada riwayat transaksi...
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3 font-bold"
          >
            <CheckCircle2 size={24} /> Rekap Berhasil Diunduh!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
