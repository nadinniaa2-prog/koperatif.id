import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Download, TrendingUp, TrendingDown, 
  Calendar, PieChart, BarChart, ArrowRight, X,
  Printer, Building, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart as ReBarChart, 
  Bar, Cell, PieChart as RePieChart, Pie
} from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const data = [
  { name: 'Jan', income: 4000, expense: 2400 },
  { name: 'Feb', income: 3000, expense: 1398 },
  { name: 'Mar', income: 2000, expense: 9800 },
  { name: 'Apr', income: 2780, expense: 3908 },
  { name: 'Mei', income: 1890, expense: 4800 },
  { name: 'Jun', income: 2390, expense: 3800 },
];

const pieData = [
  { name: 'Simpanan', value: 400 },
  { name: 'Unit Usaha', value: 300 },
  { name: 'Pinjaman', value: 300 },
  { name: 'Lainnya', value: 200 },
];

const COLORS = ['#185ADB', '#00BFFF', '#0A1931', '#F8FAFC'];

export default function ReportsPage() {
  const [period, setPeriod] = React.useState('Mei 2026');
  const [isExporting, setIsExporting] = React.useState(false);
  const [showPeriodModal, setShowPeriodModal] = React.useState(false);
  const [recentOrders, setRecentOrders] = React.useState<any[]>([]);
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const [showPdfPreview, setShowPdfPreview] = React.useState(false);
  const [preparedName, setPreparedName] = React.useState(() => {
    return localStorage.getItem('signature_prepared_name') || 'Ahmad Suherman, S.E.';
  });
  const [preparedTitle, setPreparedTitle] = React.useState(() => {
    return localStorage.getItem('signature_prepared_title') || 'Bendahara Koperasi';
  });
  const [approvedName, setApprovedName] = React.useState(() => {
    return localStorage.getItem('signature_approved_name') || 'Dr. H. Mulyono Gani';
  });
  const [approvedTitle, setApprovedTitle] = React.useState(() => {
    return localStorage.getItem('signature_approved_title') || 'Ketua Koperasi';
  });
  const [showSignatureSettings, setShowSignatureSettings] = React.useState(true);

  const isIframe = typeof window !== 'undefined' && window.self !== window.top;

  const coopBrandingName = React.useMemo(() => {
    return localStorage.getItem('coop_name') || 'Koperatif.id';
  }, []);

  React.useEffect(() => {
    const fetchOrders = () => {
      const saved = localStorage.getItem('koperasi_orders');
      if (saved) setRecentOrders(JSON.parse(saved));
    };
    fetchOrders();
    window.addEventListener('koperasi_orders_updated', fetchOrders);
    window.addEventListener('storage', fetchOrders);
    return () => {
      window.removeEventListener('koperasi_orders_updated', fetchOrders);
      window.removeEventListener('storage', fetchOrders);
    };
  }, []);

  const handleExcelExport = () => {
    setIsExporting(true);
    
    // Simulate real export process
    setTimeout(() => {
      try {
        // Data to export (summary of current report views)
        const exportData = [
          ['KATEGORI', 'DEBIT', 'KREDIT', 'WAKTU'],
          ['Pendapatan Kantin', '450000', '-', 'Hari ini 08:30'],
          ['Pembelian Stok', '-', '1200000', 'Hari ini 07:15'],
          ['Setoran Sukarela', '200000', '-', 'Kemarin 16:45'],
          ['', '', '', ''],
          ['RINGKASAN PERIODE', period, '', ''],
          ['Surplus', '12450000', '', ''],
          ['Total Pengeluaran', '4200800', '', ''],
          ['Total Pendapatan', '16650800', '', '']
        ];

        // Convert to CSV string
        const csvContent = exportData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        // Trigger download
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Laporan_Keuangan_${period.replace(' ', '_')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setIsExporting(false);
      } catch (err) {
        console.error('Export failed', err);
        setIsExporting(false);
        alert('Gagal mengekspor laporan. Silakan coba lagi.');
      }
    }, 1500);
  };

  const handlePdfExport = async () => {
    setIsExporting(true);
    const scrollPos = window.scrollY;
    
    // Find modal container and preserve its scroll position
    const modalEl = document.getElementById('pdf-preview-modal');
    const modalScrollPos = modalEl ? modalEl.scrollTop : 0;
    
    // Scroll both window and modal to 0 to prevent canvas offsets/blank spots
    window.scrollTo(0, 0);
    if (modalEl) modalEl.scrollTop = 0;

    const isIframe = typeof window !== 'undefined' && window.self !== window.top;

    try {
      // Small timeout to allow browser layout to stabilize after scroll
      await new Promise(resolve => setTimeout(resolve, 200));

      const element = document.getElementById('pdf-report-content');
      if (!element) {
        alert('Format laporan PDF tidak ditemukan.');
        setIsExporting(false);
        window.scrollTo(0, scrollPos);
        if (modalEl) modalEl.scrollTop = modalScrollPos;
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 1.5, // 1.5x scale balances high-enough resolution with fast processing & low memory footprint
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add image to A4 PDF document
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `Laporan_Keuangan_${period.replace(' ', '_')}.pdf`;

      if (isIframe) {
        // If inside an iframe, browser security policy might block standard download triggers.
        // We throw an error with clear instructions to guide the user.
        throw new Error("IFRAME_RESTRICTION");
      }

      // Inside a real tab, try standard download
      pdf.save(fileName);
    } catch (error: any) {
      console.error('Ada masalah membuat PDF:', error);
      if (error?.message === "IFRAME_RESTRICTION") {
        alert(
          '⚠️ KEAMANAN BROWSER: Pengunduhan file diblokir saat berada di dalam pratinjau editor (Iframe UI).\n\n' +
          'Silakan ikuti cara mudah ini untuk mengunduh:\n' +
          '1. Klik tombol "Buka aplikasi di Tab Baru" ↗️ di pojok kanan atas layar Anda.\n' +
          '2. Buka kembali halaman Laporan ini dan klik "Unduh PDF" - file akan langsung terunduh secara otomatis.\n\n' +
          'Alternatif Cepat:\n' +
          'Klik tombol "Cetak (Kertas)" di sebelah tombol Unduh, lalu pilih destinasi "Simpan sebagai PDF / Save as PDF" di dialog printer komputer Anda.'
        );
      } else {
        alert(
          'Gagal mengunduh file secara otomatis karena kebijakan keamanan browser/iframe.\n\n' +
          'Atasi permasalahan ini dengan mengklik ikon "Buka di Tab Baru" ↗️ di pojok kanan atas layar Anda, kemudian coba lagi.\n\n' +
          'Atau gunakan tombol "Cetak (Kertas)" di mana Anda bisa memilih opsi "Simpan sebagai PDF" di dialog cetak.'
        );
      }
    } finally {
      setIsExporting(false);
      // Restore scroll positions
      window.scrollTo(0, scrollPos);
      if (modalEl) modalEl.scrollTop = modalScrollPos;
    }
  };

  return (
    <div className="space-y-8 pb-12 relative">
      {/* Container utama yang disembunyikan ketika mencetak PDF */}
      <div className={`space-y-8 ${showPdfPreview ? 'print:hidden' : ''}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-deep-blue">Laporan Keuangan</h2>
            <p className="text-slate-500">Analisa performa keuangan koperasi secara real-time.</p>
          </div>
          <div className="flex gap-3 relative">
            <button 
              onClick={() => setShowPeriodModal(true)}
              className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm print:hidden"
            >
              <Calendar size={18} /> {period}
            </button>
            <div className="relative print:hidden">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isExporting}
                className="gradient-blue text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-electric-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 cursor-pointer"
              >
                <Download size={18} /> {isExporting ? 'Mengekspor...' : 'Ekspor PDF/Excel'}
              </button>

              <AnimatePresence>
                {showExportMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                    <motion.div 
                      key="export-menu-dropdown"
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 py-2.5 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-2 border-b border-slate-100 mb-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PILIHAN FORMAT EKSPOR</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setShowExportMenu(false);
                          handleExcelExport();
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-all flex items-center gap-3 cursor-pointer group"
                      >
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform flex-shrink-0">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-slate-700">Ekspor Excel (.csv)</p>
                          <p className="text-[10px] text-slate-400">Data mentah spreadsheet untuk olah data</p>
                        </div>
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          setShowExportMenu(false);
                          setShowPdfPreview(true);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-all flex items-center gap-3 cursor-pointer group"
                      >
                        <div className="p-2 bg-rose-50 text-rose-600 rounded-xl group-hover:scale-110 transition-transform flex-shrink-0">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-slate-700 font-sans">Cetak & Unduh PDF</p>
                          <p className="text-[10px] text-slate-400">Dokumen formal rapi siap ditandatangani</p>
                        </div>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      {/* Period Filter Modal */}
      <AnimatePresence>
        {showPeriodModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPeriodModal(false)}
              className="absolute inset-0 bg-deep-blue/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-6 gradient-blue text-white font-bold flex justify-between items-center">
                <span>Pilih Periode Laporan</span>
                <button onClick={() => setShowPeriodModal(false)}><X size={20} /></button>
              </div>
              <div className="p-6 space-y-2">
                {['Januari 2026', 'Februari 2026', 'Maret 2026', 'April 2026', 'Mei 2026'].map((p) => (
                  <button 
                    key={p} 
                    onClick={() => { setPeriod(p); setShowPeriodModal(false); }}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                      period === p ? 'bg-sky-50 text-sky-600 border border-sky-100' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Surplus (Laba)</p>
          <h3 className="text-3xl font-black text-emerald-500">Rp 12,450,000</h3>
          <div className="mt-4 flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 w-fit px-2 py-1 rounded-lg">
            <TrendingUp size={14} /> +15.5% dari bulan lalu
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Pengeluaran</p>
          <h3 className="text-3xl font-black text-rose-500">Rp 4,200,800</h3>
          <div className="mt-4 flex items-center gap-2 text-rose-600 font-bold text-xs bg-rose-50 w-fit px-2 py-1 rounded-lg">
            <TrendingDown size={14} /> -2.4% efisiensi biaya
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-sky-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Pendapatan</p>
          <h3 className="text-3xl font-black text-sky-blue">Rp 16,650,800</h3>
          <div className="mt-4 flex items-center gap-2 text-sky-600 font-bold text-xs bg-sky-50 w-fit px-2 py-1 rounded-lg">
            <ArrowRight size={14} /> Target 85% Tercapai
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trend Arus Kas */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-extrabold text-deep-blue">Trend Arus Kas</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <div className="w-3 h-3 rounded-full bg-electric-blue"></div> Pendapatan
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <div className="w-3 h-3 rounded-full bg-rose-400"></div> Pengeluaran
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#185ADB" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#185ADB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                  }} 
                />
                <Area type="monotone" dataKey="income" stroke="#185ADB" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#FB7185" strokeWidth={3} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Alokasi Dana */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
        >
          <h3 className="text-xl font-extrabold text-deep-blue mb-8">Proporsi Sumber Dana</h3>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-md" style={{ backgroundColor: COLORS[i] }}></div>
                    <span className="text-sm font-bold text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-deep-blue">{((item.value / 1200) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Ringkasan Pesanan Katalog Terkini */}
      {recentOrders.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-deep-blue">Pesanan Katalog Terkini</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest px-8 py-4">
                <tr>
                  <th className="px-8 py-4">ID Pesanan</th>
                  <th className="px-8 py-4">Pembeli</th>
                  <th className="px-8 py-4">Produk</th>
                  <th className="px-8 py-4">Total</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.slice(0, 10).map((order, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-all font-medium text-sm">
                    <td className="px-8 py-4 text-sky-blue font-black">{order.id}</td>
                    <td className="px-8 py-4 text-deep-blue font-bold">{order.buyer}</td>
                    <td className="px-8 py-4 text-slate-500">
                      {order.items.map((item: any) => `${item.qty}x ${item.name}`).join(', ')}
                    </td>
                    <td className="px-8 py-4 text-emerald-600 font-black">Rp {order.total.toLocaleString('id-ID')}</td>
                    <td className="px-8 py-4">
                      <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-slate-400">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ringkasan Transaksi Terakhir */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-deep-blue">Log Audit Laporan</h3>
          <Link to="/app/history" className="text-sky-blue font-bold text-sm hover:underline flex items-center gap-2">
            Lihat Semua Detail <ArrowRight size={16} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest px-8 py-4">
              <tr>
                <th className="px-8 py-4">Kode Ref</th>
                <th className="px-8 py-4">Kategori Akun</th>
                <th className="px-8 py-4">Debit</th>
                <th className="px-8 py-4">Kredit</th>
                <th className="px-8 py-4">Waktu Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { ref: 'TRX-9921', cat: 'Pendapatan Kantin', d: 'Rp 450.000', k: '-', time: 'Hari ini, 08:30' },
                { ref: 'TRX-9920', cat: 'Pembelian Stok', d: '-', k: 'Rp 1.200.000', time: 'Hari ini, 07:15' },
                { ref: 'TRX-9919', cat: 'Setoran Sukarela', d: 'Rp 200.000', k: '-', time: 'Kemarin, 16:45' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-all font-medium text-sm">
                  <td className="px-8 py-4 text-sky-blue font-black">{row.ref}</td>
                  <td className="px-8 py-4 text-deep-blue font-bold">{row.cat}</td>
                  <td className="px-8 py-4 text-emerald-600">{row.d}</td>
                  <td className="px-8 py-4 text-rose-500">{row.k}</td>
                  <td className="px-8 py-4 text-slate-400">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      </div>

      {/* PDF Action / Preview Modal */}
      <AnimatePresence>
        {showPdfPreview && (
          <div id="pdf-preview-modal" className="fixed inset-0 z-[150] flex flex-col bg-deep-blue/40 backdrop-blur-sm p-4 overflow-y-auto print:fixed print:inset-0 print:bg-white print:p-0 print:z-[99999]">
            {/* Top Bar (Screen only, hidden on print) */}
            <div className="sticky top-0 z-[160] max-w-4xl w-full mx-auto bg-slate-900 text-white p-4 rounded-t-3xl flex flex-col md:flex-row gap-4 justify-between items-center print:hidden shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
              <div className="flex items-center gap-2">
                <FileText className="text-sky-blue animate-pulse" size={20} />
                <span className="font-bold text-xs sm:text-sm">Pratinjau Resmi PDF - Laporan Laba Rugi ({period})</span>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto">
                {isIframe ? (
                  <span className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                    ⚠️ Deteksi Iframe: Silakan buka aplikasi di <strong>Tab Baru</strong> (ikon kanan atas editor) agar Unduh PDF aktif!
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                    ✨ Berada di Tab Baru. Tombol unduh siap digunakan.
                  </span>
                )}
                <div className="flex gap-2">
                  <button 
                    type="button"
                    disabled={isExporting}
                    onClick={handlePdfExport}
                    className="bg-sky-blue hover:bg-sky-400 disabled:bg-slate-700 disabled:text-slate-400 text-slate-900 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-md"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Mengunduh...
                      </>
                    ) : (
                      <>
                        <Download size={14} /> Unduh PDF
                      </>
                    )}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      window.focus();
                      window.print();
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-md"
                  >
                    <Printer size={14} /> Cetak (Kertas)
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowPdfPreview(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-xl active:scale-95 transition-all cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Signature Customizer Panel */}
            <div className="max-w-4xl w-full mx-auto bg-slate-800 text-slate-100 p-4 sm:p-5 border-t border-slate-700/60 print:hidden shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-sky-blue uppercase tracking-wider flex items-center gap-1.5">
                  ✍️ Atur Tanda Tangan Laporan
                </span>
                <button 
                  type="button" 
                  onClick={() => setShowSignatureSettings(!showSignatureSettings)}
                  className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer bg-transparent border-none py-1 px-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  {showSignatureSettings ? "Sembunyikan Pengaturan" : "Tampilkan Pengaturan"}
                </button>
              </div>

              {showSignatureSettings && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs transition-all animate-in fade-in duration-200">
                  {/* Left Column: Disiapkan Oleh */}
                  <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                    <p className="font-extrabold mb-3 text-slate-200 border-b border-slate-700/50 pb-1.5 flex items-center justify-between">
                      <span>1. Disiapkan Oleh (Kiri)</span>
                      <span className="text-[9px] bg-slate-850 px-2 py-0.5 rounded text-slate-400 font-normal">Kiri Dokumen</span>
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="text-slate-450 block mb-1 text-[10px] uppercase tracking-wider font-semibold">Nama Lengkap & Gelar</label>
                        <input 
                          id="prepared-name-input"
                          type="text" 
                          value={preparedName}
                          onChange={(e) => {
                            setPreparedName(e.target.value);
                            localStorage.setItem('signature_prepared_name', e.target.value);
                          }}
                          className="w-full bg-slate-800 border border-slate-600/70 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-sky-blue focus:border-sky-blue font-semibold placeholder-slate-500"
                          placeholder="Ahmad Suherman, S.E."
                        />
                      </div>
                      <div>
                        <label className="text-slate-205 block mb-1 text-[10px] uppercase tracking-wider font-semibold">Jabatan / Peran</label>
                        <input 
                          type="text" 
                          value={preparedTitle}
                          onChange={(e) => {
                            setPreparedTitle(e.target.value);
                            localStorage.setItem('signature_prepared_title', e.target.value);
                          }}
                          className="w-full bg-slate-800 border border-slate-600/70 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-sky-blue focus:border-sky-blue placeholder-slate-500"
                          placeholder="Bendahara Koperasi"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Disetujui Oleh */}
                  <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                    <p className="font-extrabold mb-3 text-slate-200 border-b border-slate-700/50 pb-1.5 flex items-center justify-between">
                      <span>2. Disetujui Oleh (Kanan)</span>
                      <span className="text-[9px] bg-slate-850 px-2 py-0.5 rounded text-slate-400 font-normal">Kanan Dokumen</span>
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="text-slate-205 block mb-1 text-[10px] uppercase tracking-wider font-semibold">Nama Lengkap & Gelar</label>
                        <input 
                          id="approved-name-input"
                          type="text" 
                          value={approvedName}
                          onChange={(e) => {
                            setApprovedName(e.target.value);
                            localStorage.setItem('signature_approved_name', e.target.value);
                          }}
                          className="w-full bg-slate-800 border border-slate-600/70 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-sky-blue focus:border-sky-blue font-semibold placeholder-slate-500"
                          placeholder="Dr. H. Mulyono Gani"
                        />
                      </div>
                      <div>
                        <label className="text-slate-205 block mb-1 text-[10px] uppercase tracking-wider font-semibold">Jabatan / Peran</label>
                        <input 
                          type="text" 
                          value={approvedTitle}
                          onChange={(e) => {
                            setApprovedTitle(e.target.value);
                            localStorage.setItem('signature_approved_title', e.target.value);
                          }}
                          className="w-full bg-slate-800 border border-slate-600/70 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-sky-blue focus:border-sky-blue placeholder-slate-500"
                          placeholder="Ketua Koperasi"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Document Paper Sheets */}
            <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div id="pdf-report-content" className="w-full bg-white p-8 sm:p-12 rounded-b-3xl shadow-2xl print:shadow-none print:rounded-none print:p-0 flex-1 flex flex-col justify-between">
              <div>
                {/* Letterhead */}
                <div className="flex justify-between items-center border-b-4 border-slate-900 pb-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-deep-blue text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-md border-2 border-white flex-shrink-0">
                      {coopBrandingName[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-deep-blue tracking-tight uppercase">
                        {coopBrandingName}
                      </h3>
                      <p className="text-xs font-bold text-slate-400">
                        Koperasi Syariah Sejahtera Koperatif Indonesia
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Sistem Manajemen Digital Kelompok Terintegrasi
                      </p>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-black text-sky-blue uppercase tracking-widest bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-100">
                      Dokumen Resmi
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2">
                      Ref: LP-FIN/{new Date().getFullYear()}/{period.toUpperCase().replace(' ', '')}
                    </p>
                  </div>
                </div>

                {/* Report Title */}
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-black text-deep-blue uppercase tracking-wide">
                    LAPORAN PERTANGGUNGJAWABAN BULANAN
                  </h1>
                  <p className="text-slate-500 font-bold text-xs mt-1">
                    PERIODE PELAPORAN: {period.toUpperCase()}
                  </p>
                  <div className="w-24 h-1 bg-sky-blue mx-auto mt-3 rounded-full" />
                </div>

                {/* KPI Cards / Block Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                  <div className="border border-slate-200 p-5 rounded-2xl bg-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Pendapatan</p>
                    <p className="text-lg font-extrabold text-slate-800">Rp 16.650.800</p>
                  </div>
                  <div className="border border-slate-200 p-5 rounded-2xl bg-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Pengeluaran</p>
                    <p className="text-lg font-extrabold text-slate-800">Rp 4.200.800</p>
                  </div>
                  <div className="border border-sky-200 p-5 rounded-2xl bg-sky-50/50">
                    <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider mb-1">Surplus Koperasi (Laba)</p>
                    <p className="text-lg font-black text-emerald-600">Rp 12.450.000</p>
                  </div>
                </div>

                {/* Section: Proporsi */}
                <div className="mb-8 font-sans">
                  <h4 className="text-xs font-black text-deep-blue uppercase tracking-widest mb-3 border-l-4 border-sky-blue pl-2">
                    A. DISTRIBUSI ALOKASI SUMBER DANA
                  </h4>
                  <table className="w-full text-left border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 border-b border-slate-200">Sumber Kategori</th>
                        <th className="px-4 py-3 border-b border-slate-200 text-right">Nilai Proporsi</th>
                        <th className="px-4 py-3 border-b border-slate-200 text-right">Persentase</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {pieData.map((item, i) => (
                        <tr key={i}>
                          <td className="px-4 py-3 font-bold">{item.name}</td>
                          <td className="px-4 py-3 text-right font-bold">Rp {(item.value * 15000).toLocaleString('id-ID')}</td>
                          <td className="px-4 py-3 text-right font-black text-sky-blue">{((item.value / 1200) * 100).toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Section: Log Audit */}
                <div className="mb-8 font-sans">
                  <h4 className="text-xs font-black text-deep-blue uppercase tracking-widest mb-3 border-l-4 border-sky-blue pl-2">
                    B. DETAIL MUTASI TRANSAKSI TERAKHIR
                  </h4>
                  <table className="w-full text-left border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 border-b border-slate-200">Nomor Ref</th>
                        <th className="px-4 py-3 border-b border-slate-200">Kategori Mutasi</th>
                        <th className="px-4 py-3 border-b border-slate-200 text-emerald-600 text-right">Debit / Masuk</th>
                        <th className="px-4 py-3 border-b border-slate-200 text-rose-500 text-right">Kredit / Keluar</th>
                        <th className="px-4 py-3 border-b border-slate-200 text-right">Waktu Verifikasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {[
                        { ref: 'TRX-9921', cat: 'Pendapatan Kantin', d: 'Rp 450.000', k: '-', time: 'Hari ini, 08:30' },
                        { ref: 'TRX-9920', cat: 'Pembelian Stok', d: '-', k: 'Rp 1.200.000', time: 'Hari ini, 07:15' },
                        { ref: 'TRX-9919', cat: 'Setoran Sukarela', d: 'Rp 200.000', k: '-', time: 'Kemarin, 16:45' },
                      ].map((row, i) => (
                        <tr key={i}>
                          <td className="px-4 py-3 font-mono font-bold text-sky-blue">{row.ref}</td>
                          <td className="px-4 py-3 font-bold">{row.cat}</td>
                          <td className="px-4 py-3 text-right font-semibold text-emerald-600">{row.d}</td>
                          <td className="px-4 py-3 text-right font-semibold text-rose-500">{row.k}</td>
                          <td className="px-4 py-3 text-right text-slate-400">{row.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Approval Signatures */}
              <div className="mt-16 border-t border-dashed border-slate-200 pt-8 font-sans">
                <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest mb-8">Lembar Pengesahan Laporan Keuangan</p>
                <div className="grid grid-cols-2 text-center text-xs">
                  <div 
                    onClick={() => {
                      setShowSignatureSettings(true);
                      setTimeout(() => {
                        const el = document.getElementById('prepared-name-input');
                        if (el) el.focus();
                      }, 50);
                    }}
                    className="cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-colors group relative border border-transparent hover:border-slate-100"
                    title="Klik untuk mengubah nama/jabatan"
                  >
                    <p className="text-slate-400 font-bold mb-16">Disiapkan oleh,</p>
                    <p className="font-bold text-slate-800 underline group-hover:text-sky-blue transition-colors">
                      {preparedName || 'Ahmad Suherman, S.E.'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">{preparedTitle || 'Bendahara Koperasi'}</p>
                    <span className="absolute top-1 right-2 text-[8px] bg-slate-100 text-slate-400 px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity print:hidden">Ubah 📝</span>
                  </div>
                  <div 
                    onClick={() => {
                      setShowSignatureSettings(true);
                      setTimeout(() => {
                        const el = document.getElementById('approved-name-input');
                        if (el) el.focus();
                      }, 50);
                    }}
                    className="cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-colors group relative border border-transparent hover:border-slate-100"
                    title="Klik untuk mengubah nama/jabatan"
                  >
                    <p className="text-slate-400 font-bold mb-16">Disetujui oleh,</p>
                    <p className="font-bold text-slate-800 underline group-hover:text-sky-blue transition-colors">
                      {approvedName || 'Dr. H. Mulyono Gani'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">{approvedTitle || 'Ketua Koperasi'}</p>
                    <span className="absolute top-1 right-2 text-[8px] bg-slate-100 text-slate-400 px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity print:hidden">Ubah 📝</span>
                  </div>
                </div>
                <div className="mt-12 text-center text-[9px] text-slate-300">
                  <p>Dokumen ini ditandatangani secara digital sebagai arsip sah Koperasi {coopBrandingName}</p>
                  <p>Koperatif.id &copy; {new Date().getFullYear()} - Handcrafted Financial Platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
}
