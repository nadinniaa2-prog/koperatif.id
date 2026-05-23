import React, { useState } from 'react';
import { Search, UserPlus, MoreVertical, Shield, IdCard, X, Save, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const initialMembers = [
  { id: '1', name: 'Ahmad Fauzi', nis: '12021', role: 'ANGGOTA', balance: 500000 },
  { id: '2', name: 'Siti Aminah', nis: '12022', role: 'ANGGOTA', balance: 250000 },
  { id: '3', name: 'Budi Santoso', nis: '12023', role: 'ADMIN', balance: 1000000 },
  { id: '4', name: 'Dewi Lestari', nis: '12024', role: 'ANGGOTA', balance: 45000 },
];

export default function MembersPage() {
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('coop_members');
    return saved ? JSON.parse(saved) : initialMembers;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newNis, setNewNis] = useState('');
  const [newBalance, setNewBalance] = useState('');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newNis) return;

    const newMember = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      nis: newNis,
      role: 'ANGGOTA' as const,
      balance: Number(newBalance) || 0,
    };

    const updatedMembers = [newMember, ...members];
    setMembers(updatedMembers);
    localStorage.setItem('coop_members', JSON.stringify(updatedMembers));
    window.dispatchEvent(new Event('koperasi_members_updated'));
    setIsModalOpen(false);
    
    // Reset Form
    setNewName('');
    setNewNis('');
    setNewBalance('');
  };

  const toggleRole = (id: string) => {
    const updatedMembers = members.map(m => {
      if (m.id === id) {
        return { ...m, role: m.role === 'ADMIN' ? 'ANGGOTA' : 'ADMIN' };
      }
      return m;
    });
    setMembers(updatedMembers);
    localStorage.setItem('coop_members', JSON.stringify(updatedMembers));
  };

  const executeDeleteMember = (id: string) => {
    const updatedMembers = members.filter(m => m.id !== id);
    setMembers(updatedMembers);
    localStorage.setItem('coop_members', JSON.stringify(updatedMembers));
    window.dispatchEvent(new Event('koperasi_members_updated'));
    setMemberToDelete(null);
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.nis.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-deep-blue">Manajemen Anggota</h2>
          <p className="text-slate-500">Kelola data siswa dan hak akses aplikasi.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="gradient-blue text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-electric-blue/20 hover:scale-[1.02] transition-all"
        >
          <UserPlus size={20} /> Tambah Anggota Baru
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari berdasarkan nama atau NIS..." 
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-sky-blue outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-8 py-4">Profil Anggota</th>
                <th className="px-8 py-4">NIS / ID</th>
                <th className="px-8 py-4">Role</th>
                <th className="px-8 py-4">Saldo Koperasi</th>
                <th className="px-8 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                        {member.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-deep-blue">{member.name}</p>
                        <p className="text-xs text-slate-400">Terdaftar 10 Feb 2026</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-slate-600">
                    <div className="flex items-center gap-2">
                      <IdCard size={16} className="text-slate-400" />
                      {member.nis}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      member.role === 'ADMIN' ? 'bg-amber-100 text-amber-600' : 'bg-sky-100 text-sky-600'
                    }`}>
                      <Shield size={12} /> {member.role}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-bold text-deep-blue">
                    Rp {member.balance.toLocaleString()}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 justify-start">
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownId(activeDropdownId === member.id ? null : member.id);
                          }}
                          className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                            activeDropdownId === member.id 
                              ? 'bg-slate-100 text-deep-blue shadow-inner' 
                              : 'text-slate-400 hover:text-deep-blue hover:bg-slate-100'
                          }`}
                          title="Menu Aksi"
                        >
                          <MoreVertical size={18} />
                        </button>
                        
                        <AnimatePresence>
                          {activeDropdownId === member.id && (
                            <>
                              {/* Fullscreen clean Overlay backdrop to dismiss dropdown on click outside */}
                              <div 
                                className="fixed inset-0 z-40 bg-transparent" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDropdownId(null);
                                }}
                              />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                                transition={{ duration: 0.12, ease: "easeOut" }}
                                className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 origin-top-right whitespace-nowrap"
                              >
                                <p className="px-4 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-50 mb-1">Aksi Anggota</p>
                                
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleRole(member.id);
                                    setActiveDropdownId(null);
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-deep-blue transition-colors flex items-center gap-2 cursor-pointer"
                                >
                                  <Shield size={14} className="text-slate-400" />
                                  {member.role === 'ADMIN' ? 'Jadikan Anggota' : 'Jadikan Admin'}
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMemberToDelete(member.id);
                                    setActiveDropdownId(null);
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 border-t border-slate-50 mt-1 cursor-pointer"
                                >
                                  <Trash2 size={14} className="text-rose-500" />
                                  Hapus Anggota
                                </button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-slate-400 font-medium">
                    Tidak ada anggota yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Anggota */}
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
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between gradient-blue text-white">
                <h3 className="text-xl font-bold">Registrasi Anggota Baru</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddMember} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Nama Lengkap Siswa</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Contoh: Muhammad Rayhan"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-blue outline-none transition-all"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">NIS</label>
                      <input 
                        type="text" 
                        required
                        placeholder="12000"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-blue outline-none transition-all"
                        value={newNis}
                        onChange={(e) => setNewNis(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Saldo Awal (Rp)</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-blue outline-none transition-all"
                        value={newBalance}
                        onChange={(e) => setNewBalance(e.target.value)}
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
                    <Save size={20} /> Simpan Anggota
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Konfirmasi Hapus Anggota */}
      <AnimatePresence>
        {memberToDelete && (() => {
          const mObj = members.find(m => m.id === memberToDelete);
          return (
            <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMemberToDelete(null)}
                className="absolute inset-0 bg-deep-blue/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative z-10 p-6 border border-slate-100"
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mx-auto">
                    <Trash2 size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-deep-blue">Konfirmasi Hapus</h3>
                    <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                      Apakah Anda yakin ingin menghapus anggota <strong className="text-rose-600 font-bold">{mObj?.name}</strong> (NIS: <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs text-slate-600">{mObj?.nis}</span>)?
                    </p>
                    <p className="text-slate-400 text-[10px] mt-1.5 font-medium">
                      ⚠️ Tindakan ini akan menghapus data saldo & keanggotaan secara permanen.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button 
                    type="button"
                    onClick={() => setMemberToDelete(null)}
                    className="flex-1 px-5 py-3 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button 
                    type="button"
                    onClick={() => executeDeleteMember(memberToDelete)}
                    className="flex-1 px-5 py-3 rounded-2xl font-bold bg-rose-600 text-white hover:bg-rose-700 transition-all text-xs shadow-lg shadow-rose-600/20 cursor-pointer"
                  >
                    Ya, Hapus Anggota
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

