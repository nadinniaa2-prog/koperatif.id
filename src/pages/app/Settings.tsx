import React, { useState, useRef } from 'react';
import { 
  Settings as SettingsIcon, Bell, Shield, 
  Database, Globe, School, Save, RefreshCw,
  History, Lock, HelpCircle, Phone, Mail,
  Image as ImageIcon, CheckCircle2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SettingsPage() {
  const [coopName, setCoopName] = useState(() => localStorage.getItem('coop_name') || 'koperatif.id');
  const [logo, setLogo] = useState<string | null>(() => localStorage.getItem('coop_logo'));
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!oldPassword) {
      setPasswordError('Password lama harus diisi.');
      return;
    }
    if (!newPassword) {
      setPasswordError('Password baru harus diisi.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password baru minimal 6 karakter.');
      return;
    }

    // Save to user settings / local storage
    localStorage.setItem('admin_password', newPassword);
    setPasswordSuccess(true);
    setOldPassword('');
    setNewPassword('');
    setTimeout(() => {
      setPasswordSuccess(false);
    }, 3000);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogo(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    localStorage.setItem('coop_name', coopName);
    if (logo) localStorage.setItem('coop_logo', logo);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
    // Refresh to update sidebar if needed or use a context/event emitter
    window.dispatchEvent(new Event('storage')); 
  };

  return (
    <div className="max-w-4xl space-y-8 pb-12 relative">
      <div>
        <h2 className="text-2xl font-extrabold text-deep-blue">Pengaturan & Keamanan</h2>
        <p className="text-slate-500">Kelola konfigurasi aplikasi, keamanan akun, dan bantuan sistem.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Identitas & Konfigurasi Koperasi */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <School size={20} />
            </div>
            <h3 className="text-lg font-bold text-deep-blue">Konfigurasi Aplikasi</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Nama Branding (Sidebar)</label>
              <input 
                type="text" 
                value={coopName}
                onChange={(e) => setCoopName(e.target.value)}
                placeholder="Contoh: koperatif.id"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-blue outline-none transition-all font-bold text-deep-blue"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Logo Digital</label>
              <div className="flex items-center gap-4">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleLogoChange}
                />
                <div onClick={() => fileInputRef.current?.click()} className="w-14 h-14 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-100 transition-all overflow-hidden">
                  {logo ? (
                    <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={24} />
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-sky-blue border border-sky-200 px-4 py-2.5 rounded-xl hover:bg-sky-50 transition-all active:scale-95"
                >
                  Ganti Logo
                </button>
                {logo && (
                  <button onClick={() => setLogo(null)} className="text-xs font-bold text-rose-500">Hapus</button>
                )}
              </div>
            </div>
            <div className="space-y-2 lg:col-span-2 border-t border-slate-50 pt-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Bunga Pinjaman (%)</label>
                  <input type="number" defaultValue="0" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-blue outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Pajak/Admin Fee Mart (Rp)</label>
                  <input type="number" defaultValue="500" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-blue outline-none" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Audit Logs - Admin Only Section Placeholder */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <History size={20} />
              </div>
              <h3 className="text-lg font-bold text-deep-blue">Audit Logs (Log Aktivitas)</h3>
            </div>
            <button className="text-xs font-bold text-amber-600 hover:underline">Ekspor Log (.CSV)</button>
          </div>
          
          <div className="space-y-4">
            {[
              { action: 'Perubahan Harga Barang', user: 'Admin Guru', time: '10 menit yang lalu', detail: 'Buku Tulis Sidu: Rp 3.000 -> Rp 3.500' },
              { action: 'Penghapusan Anggota', user: 'Admin Utama', time: '2 jam yang lalu', detail: 'ID: 12099 - Siswa Pindahan' },
              { action: 'Pembaruan Kebijakan', user: 'Admin Guru', time: '1 hari yang lalu', detail: 'Limit Pinjaman dinaikkan ke Rp 500.000' }
            ].map((log, i) => (
              <div key={i} className="flex items-start justify-between py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 rounded-lg px-2 transition-all">
                <div>
                  <p className="text-sm font-bold text-deep-blue">{log.action}</p>
                  <p className="text-xs text-slate-400">{log.detail}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-700">{log.user}</p>
                  <p className="text-[10px] text-slate-400">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Ganti Password */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <Lock size={20} />
              </div>
              <h3 className="text-lg font-bold text-deep-blue">Ganti Password</h3>
            </div>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 font-bold rounded-xl text-xs">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold rounded-xl text-xs">
                  Password berhasil diperbarui!
                </div>
              )}
              <input 
                type="password" 
                placeholder="Password Lama" 
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-200 outline-none transition-all font-medium text-sm" 
              />
              <input 
                type="password" 
                placeholder="Password Baru" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-200 outline-none transition-all font-medium text-sm" 
              />
              <button 
                type="submit"
                className="w-full py-3 bg-rose-500 text-white rounded-xl font-bold text-sm hover:bg-rose-600 active:scale-[0.98] transition-all"
              >
                Update Password
              </button>
            </form>
          </motion.div>

          {/* Bantuan / Support */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                <HelpCircle size={20} />
              </div>
              <h3 className="text-lg font-bold text-deep-blue">Bantuan & Support</h3>
            </div>
            <p className="text-sm text-slate-500 mb-6 font-medium">Hubungi Pembina Koperasi jika terdapat ketidaksesuaian data saldo atau transaksi.</p>
            <div className="space-y-3">
              <a href="#" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-600 hover:text-sky-600 transition-all group border border-transparent hover:border-sky-100">
                <Phone size={18} />
                <span className="text-sm font-bold">WhatsApp Pembina (Guru)</span>
              </a>
              <a href="#" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-600 hover:text-sky-600 transition-all group border border-transparent hover:border-sky-100">
                <Mail size={18} />
                <span className="text-sm font-bold">Email Support Sekolah</span>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Global Save Button */}
        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-10 py-4 rounded-2xl font-black gradient-blue text-white shadow-xl shadow-electric-blue/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Save size={20} /> Simpan Perubahan Sistem
          </button>
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
            <CheckCircle2 size={24} /> Pengaturan Berhasil Disimpan!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
