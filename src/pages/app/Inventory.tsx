import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, Search, PlusCircle, ShoppingCart, 
  Trash2, CreditCard, ChevronRight, Barcode,
  X, Save, CheckCircle2, Image as ImageIcon, Camera, Scan
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Html5Qrcode } from 'html5-qrcode';

const initialProducts = [
  { id: '1', name: 'Roti Coklat Lumer', price: 5000, stock: 15, category: 'Makanan', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=400', barcode: '8991234567890' },
  { id: '2', name: 'Air Mineral 600ml', price: 3000, stock: 50, category: 'Minuman', image: 'https://images.unsplash.com/photo-1616118132261-dd52b5fb40f8?q=80&w=400', barcode: '8992233445566' },
  { id: '3', name: 'Susu UHT Coklat', price: 6500, stock: 12, category: 'Minuman', image: 'https://images.unsplash.com/photo-1563636619-e910f01ff1d5?q=80&w=400', barcode: '8993344556677' },
  { id: '4', name: 'Pulpen Gel Hitam', price: 4000, stock: 25, category: 'Alat Tulis', image: 'https://images.unsplash.com/photo-1585336139118-24cc3f20ea31?q=80&w=400', barcode: '8994455667788' },
  { id: '5', name: 'Buku Tulis Sidu 38', price: 4500, stock: 40, category: 'Alat Tulis', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=400', barcode: '8995566778899' },
  { id: '6', name: 'Dasi SMA/SMK', price: 15000, stock: 10, category: 'Atribut Sekolah', image: 'https://images.unsplash.com/photo-1589756823851-4115cc71dadb?q=80&w=400', barcode: '8996677889900' },
  { id: '7', name: 'Kripik Singkong Balado', price: 2500, stock: 20, category: 'Makanan', image: 'https://images.unsplash.com/photo-1621447509323-5705b2ef769b?q=80&w=400', barcode: '8997788990011' },
  { id: '8', name: 'Teh Botol Dingin', price: 4500, stock: 18, category: 'Minuman', image: 'https://plus.unsplash.com/premium_photo-1664124381850-930f305e6088?q=80&w=400', barcode: '8998899001122' },
  { id: '9', name: 'Penghapus Putih', price: 2000, stock: 15, category: 'Alat Tulis', image: 'https://images.unsplash.com/photo-1586075010633-2470fd2058bc?q=80&w=400', barcode: '8999900112233' },
  { id: '10', name: 'Kaos Kaki Putih', price: 12000, stock: 8, category: 'Atribut Sekolah', image: 'https://images.unsplash.com/photo-1582966298438-601e3f886f4b?q=80&w=400', barcode: '8990011223344' },
];


export default function InventoryPOSPage() {
  const userRole = localStorage.getItem('user_role') || 'ANGGOTA';
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('koperasi_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved products', e);
        return initialProducts;
      }
    }
    return initialProducts;
  });

  useEffect(() => {
    localStorage.setItem('koperasi_products', JSON.stringify(products));
    window.dispatchEvent(new Event('koperasi_products_updated'));
  }, [products]);

  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [customerName] = useState(() => localStorage.getItem('user_name') || 'Pelanggan Mart');



  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [scannerTarget, setScannerTarget] = useState<'CART' | 'FIELD'>('CART');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let timeoutId: any;

    const startScanner = async () => {
      try {
        if (!isBarcodeModalOpen) return;

        // Wait a bit for modal animation and DOM to be ready
        await new Promise(resolve => timeoutId = setTimeout(resolve, 500));
        
        const element = document.getElementById("reader");
        if (!element) return;

        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            if (scannerTarget === 'CART') {
              const product = products.find(p => (p as any).barcode === decodedText);
              if (product) {
                addToCart(product);
                setIsBarcodeModalOpen(false);
              }
            } else {
              setNewBarcode(decodedText);
              setIsBarcodeModalOpen(false);
            }
          },
          () => {} // Ignored errors
        );
      } catch (err) {
        console.error("Scanner start error:", err);
      }
    };

    if (isBarcodeModalOpen) {
      startScanner();
    }

    return () => {
      clearTimeout(timeoutId);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
        }).catch(err => console.error("Scanner stop error:", err));
      }
    };
  }, [isBarcodeModalOpen, products]);

  // New/Edit Product Form State
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newCategory, setNewCategory] = useState('Alat Tulis');
  const [newImage, setNewImage] = useState<string | null>(null);
  const [imageInputType, setImageInputType] = useState<'URL' | 'FILE'>('FILE');
  const [imageUrl, setImageUrl] = useState('');
  const [newBarcode, setNewBarcode] = useState('');

  const ProductImage = ({ src, alt, className, iconSize = 24 }: { src?: string, alt?: string, className?: string, iconSize?: number }) => {
    const [hasError, setHasError] = useState(false);
    
    // Reset error state if src changes
    useEffect(() => {
      setHasError(false);
    }, [src]);

    if (!src || hasError) {
      return (
        <div className={`${className} flex items-center justify-center bg-slate-50 text-slate-300`}>
          <Package size={iconSize} />
        </div>
      );
    }

    return (
      <img 
        src={src} 
        alt={alt} 
        className={className} 
        onError={() => setHasError(true)} 
      />
    );
  };

  const openEditModal = (e: React.MouseEvent, product: any) => {
    e.stopPropagation(); // Prevent adding to cart
    setEditingProduct(product);
    setNewName(product.name);
    setNewPrice(product.price.toString());
    setNewStock(product.stock.toString());
    setNewCategory(product.category);
    setNewImage(product.image || null);
    setImageUrl(product.image && !product.image.startsWith('data:') ? product.image : '');
    setImageInputType(product.image && product.image.startsWith('data:') ? 'FILE' : 'URL');
    setNewBarcode(product.barcode || '');
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const finalImage = imageInputType === 'FILE' ? newImage : imageUrl;

    setProducts(products.map(p => p.id === editingProduct.id ? {
      ...p,
      name: newName,
      price: Number(newPrice),
      stock: Number(newStock),
      category: newCategory,
      image: finalImage,
      barcode: newBarcode
    } : p));

    setIsEditModalOpen(false);
    setEditingProduct(null);
    setNewName(''); setNewPrice(''); setNewStock(''); setNewImage(null); setNewBarcode(''); setImageUrl('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [isItemAdded, setIsItemAdded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [activeMethod, setActiveMethod] = useState<'SALDO' | 'TUNAI'>('TUNAI');

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    setIsItemAdded(true);
    setTimeout(() => setIsItemAdded(false), 1500);
  };

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    const finalImage = imageInputType === 'FILE' ? newImage : imageUrl;
    const newProduct = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      price: Number(newPrice),
      stock: Number(newStock),
      category: newCategory,
      image: finalImage,
      barcode: newBarcode
    };
    setProducts([newProduct, ...products]);
    setIsStockModalOpen(false);
    // Reset
    setNewName(''); setNewPrice(''); setNewStock(''); setNewImage(null); setNewBarcode(''); setImageUrl('');
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const handleCheckout = (method: string = 'SALDO') => {
    if (cart.length === 0) return;
    
    setPaymentMethod(method === 'SALDO' ? 'Saldo Koperasi' : 'Tunai Physical');
    
    // Deduct stock
    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(item => item.id === p.id);
      if (cartItem) {
        return { ...p, stock: Math.max(0, p.stock - cartItem.qty) };
      }
      return p;
    }));
    
    // Save to localStorage for History demonstration
    const newTransaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'MART',
      name: customerName,
      amount: total,
      date: new Date().toLocaleString('sv-SE').slice(0, 16).replace('T', ' '),
      status: 'SUCCESS',
      method: method,
      note: `Belanja Mart: ${cart.map(i => i.name).join(', ')}`
    };

    const existing = JSON.parse(localStorage.getItem('koperasi_transactions') || '[]');
    localStorage.setItem('koperasi_transactions', JSON.stringify([newTransaction, ...existing]));

    setIsSuccessModalOpen(true);
    setCart([]);
    setTimeout(() => setIsSuccessModalOpen(false), 3000);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
      {/* Product Selection */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-deep-blue">POS & Katalog Barang</h2>
          {userRole === 'ADMIN' && (
            <button 
              onClick={() => setIsStockModalOpen(true)}
              className="text-sky-blue font-bold flex items-center gap-2 hover:underline bg-sky-50 px-4 py-2 rounded-xl transition-all"
            >
              <PlusCircle size={20} /> Stok Baru
            </button>
          )}
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-blue transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Cari barcode atau nama barang..." 
            className="w-full pl-12 pr-16 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm outline-none focus:ring-2 focus:ring-sky-blue transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            onClick={() => {
              setScannerTarget('CART');
              setIsBarcodeModalOpen(true);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-sky-blue hover:text-white transition-all shadow-sm"
            title="Scan Barcode"
          >
            <Barcode size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredProducts.map((p) => (
              <motion.div 
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => addToCart(p)}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm cursor-pointer hover:border-sky-blue transition-all group relative"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-sky-50 transition-all overflow-hidden relative">
                  <ProductImage 
                    src={(p as any).image} 
                    alt={p.name} 
                    className="w-full h-full object-cover" 
                    iconSize={24}
                  />
                </div>
                {userRole === 'ADMIN' && (
                  <button 
                    onClick={(e) => openEditModal(e, p)}
                    className="absolute top-4 right-4 p-2 bg-slate-50 text-slate-400 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-sky-blue hover:text-white transition-all z-10"
                  >
                    <PlusCircle className="rotate-45" size={16} />
                  </button>
                )}
                <h4 className="font-bold text-deep-blue truncate">{p.name}</h4>
                <p className="text-sm text-slate-400 mb-4">{p.category}</p>
                <div className="flex items-center justify-between">
                  <span className="font-black text-electric-blue">Rp {p.price.toLocaleString()}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Stok: {p.stock}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-400">
              Barang tidak ditemukan...
            </div>
          )}
        </div>
      </div>

      {/* Cart / Checkout */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col h-[calc(100vh-160px)] sticky top-24">
        <div className="p-6 gradient-blue text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} />
            <span className="font-bold">Keranjang</span>
          </div>
          <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">{cart.length} Item</span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 space-y-4 text-center">
                <Barcode size={48} />
                <p className="text-sm font-medium">Klik pada barang untuk <br /> menambahkan ke keranjang</p>
              </div>
            ) : (
              cart.map((item) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={item.id} 
                  className="flex items-center justify-between group py-2"
                >
                  <div className="flex-1">
                    <p className="font-bold text-deep-blue text-sm">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.qty} x Rp {item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setCart(cart.filter(i => i.id !== item.id))}
                      className="p-1 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                    <span className="font-bold text-deep-blue whitespace-nowrap text-sm">Rp {(item.price * item.qty).toLocaleString()}</span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 bg-slate-50 space-y-4">

          <div className="flex justify-between items-center text-slate-500 text-sm">
            <span>Subtotal</span>
            <span>Rp {total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-deep-blue font-black text-xl">
            <span>Total</span>
            <span>Rp {total.toLocaleString()}</span>
          </div>
          <button 
            disabled={cart.length === 0}
            onClick={() => handleCheckout(activeMethod)}
            className="w-full gradient-blue text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-electric-blue/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
          >
            Proses Pembayaran <ChevronRight size={20} />
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveMethod('SALDO')}
              className={`flex-1 py-2 border rounded-xl text-[10px] font-black flex items-center justify-center gap-1 uppercase transition-all ${
                activeMethod === 'SALDO' 
                ? 'bg-sky-blue text-white border-sky-blue shadow-md' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CreditCard size={12} /> Saldo Koperasi
            </button>
            <button 
              onClick={() => setActiveMethod('TUNAI')}
              className={`flex-1 py-2 border rounded-xl text-[10px] font-black flex items-center justify-center gap-1 uppercase transition-all ${
                activeMethod === 'TUNAI' 
                ? 'bg-sky-blue text-white border-sky-blue shadow-md' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Tunai Physical
            </button>
          </div>
        </div>
      </div>

      {/* Modal Stok Baru */}
      <AnimatePresence>
        {isStockModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsStockModalOpen(false)}
              className="absolute inset-0 bg-deep-blue/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-6 gradient-blue text-white flex items-center justify-between">
                <h3 className="text-xl font-bold">Input Barang Baru</h3>
                <button onClick={() => setIsStockModalOpen(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleAddStock} className="p-6 space-y-4">
                <div className="space-y-4">
                  <div className="flex gap-2 p-1 bg-slate-50 rounded-xl">
                    <button 
                      type="button"
                      onClick={() => setImageInputType('FILE')}
                      className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${imageInputType === 'FILE' ? 'bg-white shadow-sm text-sky-blue' : 'text-slate-400'}`}
                    >
                      UPLOAD FILE
                    </button>
                    <button 
                      type="button"
                      onClick={() => setImageInputType('URL')}
                      className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${imageInputType === 'URL' ? 'bg-white shadow-sm text-sky-blue' : 'text-slate-400'}`}
                    >
                      LINK GAMBAR (URL)
                    </button>
                  </div>

                  {imageInputType === 'FILE' ? (
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="w-32 h-32 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden relative group">
                          {newImage ? (
                            <img src={newImage} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <ImageIcon size={32} className="text-slate-300" />
                              <p className="text-[10px] font-bold text-slate-400 mt-2">PILIH FILE</p>
                            </>
                          )}
                          <label className="absolute inset-0 cursor-pointer bg-black/0 hover:bg-black/20 flex items-center justify-center transition-all">
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            <Camera size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </label>
                        </div>
                        {newImage && (
                          <button 
                            type="button" 
                            onClick={() => setNewImage(null)}
                            className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full border-4 border-white shadow-lg"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-1">Link Gambar (https://...)</label>
                      <div className="flex gap-2">
                        <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 shrink-0">
                          <ProductImage src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <input 
                          value={imageUrl} 
                          onChange={e => setImageUrl(e.target.value)} 
                          type="text" 
                          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-blue outline-none transition-all text-sm" 
                          placeholder="https://images.unsplash.com/..." 
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">Nama Barang</label>
                  <input required value={newName} onChange={e => setNewName(e.target.value)} type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-blue outline-none transition-all" placeholder="Penghapus Kenko" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-1">Harga (Rp)</label>
                    <input required value={newPrice} onChange={e => setNewPrice(e.target.value)} type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-blue outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-1">Stok Awal</label>
                    <input required value={newStock} onChange={e => setNewStock(e.target.value)} type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-blue outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">Barcode (Opsional)</label>
                  <div className="relative">
                    <input value={newBarcode} onChange={e => setNewBarcode(e.target.value)} type="text" className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-blue outline-none transition-all" placeholder="EAN-13" />
                    <button 
                      type="button"
                      onClick={() => {
                        setScannerTarget('FIELD');
                        setIsBarcodeModalOpen(true);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-sky-blue transition-colors"
                    >
                      <Scan size={20} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">Kategori</label>
                  <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-sky-blue">
                    <option>Makanan</option>
                    <option>Minuman</option>
                    <option>Camilan</option>
                    <option>Alat Tulis</option>
                    <option>Atribut Sekolah</option>
                  </select>
                </div>
                <button className="w-full py-4 gradient-blue text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-electric-blue/20 mt-4">
                  <Save size={20} /> Simpan ke Inventaris
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Edit Barang */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-deep-blue/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-6 gradient-blue text-white flex items-center justify-between">
                <h3 className="text-xl font-bold">Edit Detail Barang</h3>
                <button onClick={() => setIsEditModalOpen(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleUpdateProduct} className="p-6 space-y-4">
                <div className="space-y-4">
                  <div className="flex gap-2 p-1 bg-slate-50 rounded-xl">
                    <button 
                      type="button"
                      onClick={() => setImageInputType('FILE')}
                      className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${imageInputType === 'FILE' ? 'bg-white shadow-sm text-sky-blue' : 'text-slate-400'}`}
                    >
                      UPLOAD FILE
                    </button>
                    <button 
                      type="button"
                      onClick={() => setImageInputType('URL')}
                      className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${imageInputType === 'URL' ? 'bg-white shadow-sm text-sky-blue' : 'text-slate-400'}`}
                    >
                      LINK GAMBAR (URL)
                    </button>
                  </div>

                  {imageInputType === 'FILE' ? (
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="w-32 h-32 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden relative group">
                          {newImage ? (
                            <img src={newImage} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <ImageIcon size={32} className="text-slate-300" />
                              <p className="text-[10px] font-bold text-slate-400 mt-2">PILIH FILE</p>
                            </>
                          )}
                          <label className="absolute inset-0 cursor-pointer bg-black/0 hover:bg-black/20 flex items-center justify-center transition-all">
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            <Camera size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </label>
                        </div>
                        {newImage && (
                          <button 
                            type="button" 
                            onClick={() => setNewImage(null)}
                            className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full border-4 border-white shadow-lg"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-1">Link Gambar (https://...)</label>
                      <div className="flex gap-2">
                        <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 shrink-0">
                          <ProductImage src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <input 
                          value={imageUrl} 
                          onChange={e => setImageUrl(e.target.value)} 
                          type="text" 
                          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-blue outline-none transition-all text-sm" 
                          placeholder="https://images.unsplash.com/..." 
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">Nama Barang</label>
                  <input required value={newName} onChange={e => setNewName(e.target.value)} type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-blue outline-none transition-all" placeholder="Penghapus Kenko" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-1">Harga (Rp)</label>
                    <input required value={newPrice} onChange={e => setNewPrice(e.target.value)} type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-blue outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-1">Stok</label>
                    <input required value={newStock} onChange={e => setNewStock(e.target.value)} type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-blue outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">Barcode</label>
                  <div className="relative">
                    <input value={newBarcode} onChange={e => setNewBarcode(e.target.value)} type="text" className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-blue outline-none transition-all" />
                    <button 
                      type="button"
                      onClick={() => {
                        setScannerTarget('FIELD');
                        setIsBarcodeModalOpen(true);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-sky-blue transition-colors"
                    >
                      <Scan size={20} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">Kategori</label>
                  <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-sky-blue">
                    <option>Makanan</option>
                    <option>Minuman</option>
                    <option>Camilan</option>
                    <option>Alat Tulis</option>
                    <option>Atribut Sekolah</option>
                  </select>
                </div>
                <div className="flex gap-3 mt-4">
                  <button 
                    type="button"
                    onClick={() => {
                      setProducts(products.filter(p => p.id !== editingProduct.id));
                      setIsEditModalOpen(false);
                    }}
                    className="flex-1 py-4 bg-rose-50 text-rose-500 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-rose-100 transition-all"
                  >
                    Hapus
                  </button>
                  <button className="flex-[2] py-4 gradient-blue text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-electric-blue/20">
                    <Save size={20} /> Simpan Perubahan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Barcode Scanner Modal */}
      <AnimatePresence>
        {isBarcodeModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBarcodeModalOpen(false)}
              className="absolute inset-0 bg-deep-blue/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-8 gradient-blue text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <Scan size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">Scan Barcode</h3>
                    <p className="text-xs text-white/70 font-bold uppercase tracking-wider">Arahkan kamera ke barcode produk</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsBarcodeModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-all"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-8">
                <div id="reader" className="overflow-hidden rounded-3xl border-4 border-slate-100 bg-slate-50 aspect-square"></div>
                <div className="mt-6 flex flex-col items-center text-center">
                  <div className="p-4 bg-sky-50 text-sky-blue rounded-2xl mb-4">
                    <Barcode size={32} />
                  </div>
                  <p className="text-sm text-slate-500 font-medium">Bisa memindai barcode standar seperti EAN, UPC, dll. <br /> Produk akan otomatis masuk ke keranjang.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Notification for Checkout */}
      <AnimatePresence>
        {isSuccessModalOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3 font-bold"
          >
            <CheckCircle2 size={24} /> Transaksi via {paymentMethod} Berhasil!
          </motion.div>
        )}
        {isItemAdded && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] bg-deep-blue text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-bold"
          >
            <PlusCircle size={18} className="text-sky-blue" /> Barang ditambahkan ke keranjang
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
