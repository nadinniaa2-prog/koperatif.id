import React, { useState } from 'react';
import { Lock, ShieldCheck, Key, Eye, EyeOff, Save, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SecurityPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="max-w-2xl space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-extrabold text-deep-blue">Keamanan Akun</h2>
        <p className="text-slate-500">Perbarui kata sandi Anda secara berkala untuk menjaga keamanan akun.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm"
      >
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-sky-50 text-sky-blue rounded-2xl flex items-center justify-center">
            <Lock size={28} />
          </div>
          <div>
            <h3 className="text-xl font-black text-deep-blue">Ganti Kata Sandi</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Update Password Autentikasi</p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Kata Sandi Saat Ini</label>
            <div className="relative">
              <input 
                type={showCurrent ? "text" : "password"}
                className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-sky-blue transition-all"
                placeholder="Masukkan kata sandi lama"
              />
              <button 
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-blue"
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Kata Sandi Baru</label>
            <div className="relative">
              <input 
                type={showNew ? "text" : "password"}
                className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-sky-blue transition-all"
                placeholder="Minimal 8 karakter"
              />
              <button 
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-blue"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Konfirmasi Kata Sandi Baru</label>
            <input 
              type={showNew ? "text" : "password"}
              className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-sky-blue transition-all"
              placeholder="Ulangi kata sandi baru"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit"
              className="px-10 py-4 gradient-blue text-white rounded-2xl font-black shadow-xl shadow-electric-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
            >
              <Save size={20} /> Simpan Kata Sandi Baru
            </button>
          </div>
        </form>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex gap-4">
          <ShieldCheck className="text-emerald-500 flex-shrink-0" size={24} />
          <div>
            <h4 className="font-bold text-emerald-900 text-sm">Autentikasi Aman</h4>
            <p className="text-xs text-emerald-700 mt-1 leading-relaxed">Akun Anda dilindungi dengan enkripsi standar industri.</p>
          </div>
        </div>
        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 flex gap-4">
          <Key className="text-slate-400 flex-shrink-0" size={24} />
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Login Terakhir</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">Hari ini, 08:30 WIB dari Chrome (Windows)</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-12 right-12 bg-emerald-500 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3 font-bold z-50"
          >
            <CheckCircle2 size={24} /> Kata Sandi Berhasil Diperbarui!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
