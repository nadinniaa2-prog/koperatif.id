import React, { useState, useEffect } from 'react';
import { CreditCard, Wallet, Calendar, AlertCircle, ArrowRight, X, CheckCircle2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function LoansPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [myLoans, setMyLoans] = useState<any[]>([]);

  const userEmail = localStorage.getItem('user_email');
  const currentUserName = localStorage.getItem('user_name') || 
    userEmail?.split('@')[0].split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 
    'Anggota Koperasi';

  const userName = currentUserName;

  useEffect(() => {
    const fetchLoans = () => {
      const allLoans = JSON.parse(localStorage.getItem('koperasi_loans') || '[]');
      // Filter loans for this user by exact name match
      const filtered = allLoans.filter((l: any) => String(l.name).toLowerCase() === currentUserName.toLowerCase());
      setMyLoans(filtered);
    };

    fetchLoans();

    const handleStorage = () => fetchLoans();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('koperasi_loans_updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('koperasi_loans_updated', handleStorage);
    };
  }, [userName]);

  const [loanPayments, setLoanPayments] = useState<any[]>([]);

  useEffect(() => {
    const fetchTransactions = () => {
      const allTxs = JSON.parse(localStorage.getItem('koperasi_transactions') || '[]');
      const payments = allTxs.filter((t: any) => 
        String(t.name).toLowerCase() === currentUserName.toLowerCase() && 
        t.type === 'ANGSURAN'
      );
      setLoanPayments(payments);
    };

    fetchTransactions();
    window.addEventListener('koperasi_transactions_updated', fetchTransactions);
    return () => window.removeEventListener('koperasi_transactions_updated', fetchTransactions);
  }, [currentUserName]);

  // Determine the active loan from myLoans
  const activeLoanFromHistory = myLoans.find(l => l.status === 'APPROVED');
  
  // Calculate total paid from real transactions
  const totalPaid = loanPayments
    .filter(p => p.status === 'SUCCESS' || p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  const currentLoanDisplay = activeLoanFromHistory ? {
    amount: activeLoanFromHistory.amount,
    remaining: Math.max(0, activeLoanFromHistory.amount - totalPaid),
    tenure: 'Aktif',
    dueDate: '15 setiap bulan',
    status: 'AKTIF'
  } : {
    amount: 1200000,
    remaining: Math.max(0, 1200000 - totalPaid),
    tenure: '12 Bulan',
    dueDate: '15 Mei 2026',
    status: 'AKTIF'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new loan application
    const newLoan = {
      id: Math.random().toString(36).substr(2, 9),
      name: userName,
      amount: Number(amount),
      duration: 'Belum ditentukan',
      purpose: reason,
      status: 'PENDING',
      date: new Date().toISOString().split('T')[0]
    };

    // Save to localStorage
    const savedLoans = JSON.parse(localStorage.getItem('koperasi_loans') || '[]');
    const updated = [newLoan, ...savedLoans];
    localStorage.setItem('koperasi_loans', JSON.stringify(updated));
    
    // Notify other components in the same window
    window.dispatchEvent(new Event('koperasi_loans_updated'));
    
    setMyLoans(updated.filter(l => l.name === userName));

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsModalOpen(false);
      setAmount('');
      setReason('');
    }, 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-extrabold text-deep-blue">Pinjaman Saya</h2>
        <p className="text-slate-500">Kelola dan pantau status pinjaman aktif Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full -mr-16 -mt-16"></div>
            <div className="flex items-start justify-between relative">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sisa Pinjaman</p>
                <h3 className="text-4xl font-black text-deep-blue">Rp {currentLoanDisplay.remaining.toLocaleString('id-ID')}</h3>
                <p className="text-xs text-slate-500 mt-2 font-medium">Dari total pinjaman Rp {currentLoanDisplay.amount.toLocaleString('id-ID')}</p>
              </div>
              <span className="bg-emerald-100 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                {currentLoanDisplay.status}
              </span>
            </div>
 
            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-50">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Tenor</p>
                <p className="font-bold text-deep-blue">{currentLoanDisplay.tenure}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Jatuh Tempo Berikutnya</p>
                <p className="font-bold text-rose-500">{currentLoanDisplay.dueDate}</p>
              </div>
            </div>
          </motion.div>

          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-deep-blue">Riwayat Pembayaran</h3>
            </div>
            <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
              {loanPayments.length > 0 ? loanPayments.map((h, i) => (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-deep-blue">{h.note || 'Angsuran Pinjaman'}</p>
                      <p className="text-xs text-slate-400 font-medium">{h.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${h.status === 'SUCCESS' || h.status === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      Rp {h.amount.toLocaleString('id-ID')}
                    </p>
                    <p className="text-[10px] font-black text-slate-400 uppercase">
                      {h.status === 'SUCCESS' || h.status === 'COMPLETED' ? 'BERHASIL' : 'DITINJAU'}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center text-slate-400">
                  <p className="text-sm italic">Belum ada riwayat pembayaran...</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Pengajuan Section */}
          {myLoans.length > 0 && (
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100">
                <h3 className="text-lg font-black text-deep-blue">Status Pengajuan Pinjaman</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {myLoans.map((loan) => (
                  <div key={loan.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                        loan.status === 'PENDING' ? 'bg-amber-50 text-amber-500' :
                        loan.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-500' :
                        'bg-rose-50 text-rose-500'
                      }`}>
                        {loan.status === 'PENDING' ? <Clock size={18} /> :
                         loan.status === 'APPROVED' ? <CheckCircle size={18} /> :
                         <XCircle size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-deep-blue">Pinjaman Rp {loan.amount?.toLocaleString('id-ID')}</p>
                        <p className="text-xs text-slate-400 font-medium">{loan.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        loan.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                        loan.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-rose-100 text-rose-600'
                      }`}>
                        {loan.status === 'PENDING' ? 'Menunggu' :
                         loan.status === 'APPROVED' ? 'Disetujui' :
                         'Ditolak'}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1 truncate max-w-[120px]">{loan.purpose}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-deep-blue text-white p-8 rounded-[40px] shadow-2xl shadow-deep-blue/20">
            <h3 className="text-xl font-bold mb-4">Butuh Pinjaman Baru?</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-8">Ajukan pinjaman tambahan untuk kebutuhan sekolah atau modal usaha siswa.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full py-4 bg-sky-blue hover:bg-sky-400 text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2"
            >
              Ajukan Sekarang <ArrowRight size={18} />
            </button>
          </div>

          <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
            <div className="flex gap-4">
              <AlertCircle className="text-amber-500 flex-shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-amber-900 text-sm">Informasi Penting</h4>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  Pinjaman hanya diberikan kepada anggota yang memiliki saldo minimal 10% dari nilai pinjaman yang diajukan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSuccess && setIsModalOpen(false)}
              className="absolute inset-0 bg-deep-blue/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden relative z-10"
            >
              {isSuccess ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="text-emerald-500" size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-deep-blue mb-2">Berhasil Diajukan!</h3>
                  <p className="text-slate-500">Permohonan pinjaman Anda sedang dipreview oleh admin.</p>
                </div>
              ) : (
                <>
                  <div className="p-8 gradient-blue text-white flex items-center justify-between">
                    <h3 className="text-xl font-black">Ajukan Pinjaman</h3>
                    <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                  </div>
                  <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nominal Pinjaman</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                        <input 
                          required
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-sky-blue/10 focus:border-sky-blue outline-none transition-all font-bold"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Alasan Peminjaman</label>
                      <textarea 
                        required
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full px-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-sky-blue/10 focus:border-sky-blue outline-none transition-all font-medium h-32 resize-none"
                        placeholder="Contoh: Pembelian buku cetak..."
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-5 bg-sky-blue hover:bg-sky-400 text-white rounded-2xl font-black shadow-lg shadow-sky-blue/20 transition-all flex items-center justify-center gap-2"
                    >
                      Kirim Permohonan <ArrowRight size={18} />
                    </button>
                    <p className="text-[10px] text-center text-slate-400 font-medium">
                      Dengan mengklik tombol di atas, Anda menyetujui syarat & ketentuan yang berlaku di Koperasi Sekolah.
                    </p>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
