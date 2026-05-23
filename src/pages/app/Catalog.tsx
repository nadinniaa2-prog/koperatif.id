import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter, ShoppingCart, ChevronRight, Package, ArrowRight, CheckCircle2, Trash2, Minus, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES = ['Semua', 'Makanan', 'Minuman', 'Alat Tulis', 'Atribut Sekolah'];

const INITIAL_PRODUCTS = [
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


export default function CatalogPage() {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('koperasi_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved products', e);
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    // If it's the first time and we have no products, save INITIAL_PRODUCTS to localStorage
    if (!localStorage.getItem('koperasi_products')) {
      localStorage.setItem('koperasi_products', JSON.stringify(INITIAL_PRODUCTS));
    }

    const handleProductSync = () => {
      const saved = localStorage.getItem('koperasi_products');
      if (saved) setProducts(JSON.parse(saved));
    };

    window.addEventListener('koperasi_products_updated', handleProductSync);
    window.addEventListener('storage', handleProductSync);
    return () => {
      window.removeEventListener('koperasi_products_updated', handleProductSync);
      window.removeEventListener('storage', handleProductSync);
    };
  }, []);

  const [cart, setCart] = useState<{ id: string | number, qty: number }[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const ProductImage = ({ src, alt, className, iconSize = 48 }: { src?: string, alt?: string, className?: string, iconSize?: number }) => {
    const [hasError, setHasError] = useState(false);
    
    useEffect(() => {
      setHasError(false);
    }, [src]);

    if (!src || hasError) {
      return (
        <div className={`${className} flex items-center justify-center bg-slate-50 text-slate-200`}>
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

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'Semua' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (productId: string | number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing) {
        return prev.map(item => item.id === productId ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { id: productId, qty: 1 }];
    });
  };

  const removeFromCart = (productId: string | number) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string | number, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : item;
        }
        return item;
      }).filter(item => item.qty > 0);
    });
  };

  const totalItemsInCart = cart.reduce((acc, curr) => acc + curr.qty, 0);

  const cartDetails = cart.map(item => {
    const product = products.find(p => p.id === item.id);
    return {
      ...product,
      qty: item.qty,
      totalPrice: (product?.price || 0) * item.qty
    };
  });

  const cartTotal = cartDetails.reduce((acc, curr) => acc + curr.totalPrice, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    // Check balance
    const currentBalance = Number(localStorage.getItem('user_savings_balance') || '2500000');
    if (currentBalance < cartTotal) {
      alert('Maaf, saldo simpanan Anda tidak mencukupi untuk transaksi ini.');
      return;
    }

    // Deduct balance
    const newBalance = currentBalance - cartTotal;
    localStorage.setItem('user_savings_balance', newBalance.toString());
    window.dispatchEvent(new Event('koperasi_balance_updated'));

    // Deduct stock in central storage
    const updatedProducts = products.map(p => {
      const cartItem = cart.find(item => item.id === p.id);
      if (cartItem) {
        return { ...p, stock: Math.max(0, p.stock - cartItem.qty) };
      }
      return p;
    });
    localStorage.setItem('koperasi_products', JSON.stringify(updatedProducts));
    window.dispatchEvent(new Event('koperasi_products_updated'));

    // Create actual order data for admin
    const buyerName = localStorage.getItem('user_name') || localStorage.getItem('user_email')?.split('@')[0] || 'Anggota Koperasi';
    const newOrder = {
      id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      buyer: buyerName,
      items: cartDetails.map(item => ({
        name: item.name,
        qty: item.qty,
        price: item.price
      })),
      total: cartTotal,
      date: new Date().toLocaleString('id-ID'),
      status: 'SELESAI'
    };

    // Save to orders
    const savedOrders = JSON.parse(localStorage.getItem('koperasi_orders') || '[]');
    localStorage.setItem('koperasi_orders', JSON.stringify([newOrder, ...savedOrders]));
    
    // SAVE TO FINANCIAL TRANSACTIONS TOO
    const financialTx = {
      id: `TX-MART-${newOrder.id}`,
      name: buyerName,
      type: 'MART',
      amount: cartTotal,
      date: new Date().toISOString().split('T')[0],
      status: 'SUCCESS',
      note: `Belanja Mart: ${cartDetails.map(item => item.name).join(', ')}`
    };
    const savedTransactions = JSON.parse(localStorage.getItem('koperasi_transactions') || '[]');
    localStorage.setItem('koperasi_transactions', JSON.stringify([financialTx, ...savedTransactions]));
    window.dispatchEvent(new Event('koperasi_transactions_updated'));
    
    // Notify window for real-time updates if admin is open in another tab
    window.dispatchEvent(new Event('koperasi_orders_updated'));

    setIsSuccess(true);
    setIsCartOpen(false);
    // Delay clearing the cart slightly to avoid jarring UI shifts during close animation
    setTimeout(() => {
      setCart([]);
      setIsSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-deep-blue">Katalog Koperasi Mart</h2>
          <p className="text-slate-500">Belanja praktis menggunakan saldo koperasimu.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari jajanan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-sky-blue transition-all w-full md:w-64"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="gradient-blue text-white px-5 py-3 rounded-2xl shadow-lg shadow-electric-blue/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <ShoppingCart size={20} />
              <span className="hidden sm:inline font-bold text-sm">Keranjang</span>
              {totalItemsInCart > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white translate-x-1">
                  {totalItemsInCart}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
              activeCategory === cat 
              ? 'bg-sky-blue text-white shadow-lg shadow-sky-blue/20' 
              : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={product.id}
              className="bg-white rounded-[32px] border border-slate-100 p-5 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group flex flex-col"
            >
              <div className="bg-slate-50 aspect-square rounded-[24px] mb-4 flex items-center justify-center relative overflow-hidden group-hover:bg-sky-50 transition-colors">
                <ProductImage 
                  src={(product as any).image} 
                  alt={product.name} 
                  className="w-full h-full object-cover" 
                  iconSize={48}
                />
                <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black text-slate-500 uppercase">
                  Stok: {product.stock}
                </div>
              </div>
              
              <div className="flex-1">
                <p className="text-[10px] font-black text-sky-blue uppercase tracking-widest mb-1">{product.category}</p>
                <h4 className="font-bold text-deep-blue text-sm mb-1 leading-tight">{product.name}</h4>
                <p className="text-lg font-black text-deep-blue">Rp {product.price.toLocaleString('id-ID')}</p>
              </div>

              <button 
                onClick={() => addToCart(product.id)}
                className="mt-4 w-full gradient-blue text-white py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-electric-blue/30 active:scale-[0.98] transition-all"
              >
                Tambah <ShoppingCart size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold text-deep-blue">Produk tidak ditemukan</h3>
          <p className="text-slate-500 mt-2">Coba kata kunci lain atau pilih kategori berbeda.</p>
        </div>
      )}

      {totalItemsInCart > 0 && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[55] bg-deep-blue text-white px-8 py-5 rounded-[32px] shadow-2xl flex items-center gap-8 min-w-[320px] justify-between border-4 border-white/10 backdrop-blur-xl cursor-pointer"
          onClick={() => setIsCartOpen(true)}
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-3 rounded-2xl">
              <ShoppingBag size={24} className="text-sky-blue" />
            </div>
            <div>
              <p className="text-[10px] font-black text-sky-blue uppercase tracking-[0.2em]">Keranjang</p>
              <p className="text-lg font-black">{totalItemsInCart} Item</p>
            </div>
          </div>
          <div className="bg-sky-blue text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-sky-400 transition-all flex items-center gap-2 group">
            Lihat Keranjang <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-deep-blue/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div>
                  <h3 className="text-xl font-black text-deep-blue capitalize">Keranjang Belanja</h3>
                  <p className="text-xs text-slate-400 font-medium">Total {totalItemsInCart} produk terpilih</p>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {cartDetails.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <ShoppingBag size={32} />
                    </div>
                    <p className="text-slate-400 font-bold">Keranjangmu masih kosong</p>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="mt-4 text-sky-blue font-black text-xs uppercase tracking-widest"
                    >
                      Mulai Belanja
                    </button>
                  </div>
                ) : (
                  cartDetails.map((item) => (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0">
                        <ProductImage 
                          src={(item as any).image} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                          iconSize={24}
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <p className="text-[10px] font-black text-sky-blue uppercase tracking-widest">{item.category}</p>
                          <h5 className="text-sm font-bold text-deep-blue leading-tight mb-1">{item.name}</h5>
                          <p className="text-sm font-black text-deep-blue">Rp {item.price?.toLocaleString('id-ID')}</p>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center bg-slate-50 rounded-xl p-1 gap-3">
                            <button 
                              onClick={() => updateQuantity(item.id!, -1)}
                              className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="font-black text-xs text-deep-blue w-4 text-center">{item.qty}</span>
                            <button 
                              onClick={() => updateQuantity(item.id!, 1)}
                              className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-sky-blue transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.id!)}
                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-8 bg-slate-50/50 border-t border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm font-bold text-slate-500">Total Pembayaran</p>
                  <p className="text-2xl font-black text-deep-blue">Rp {cartTotal.toLocaleString('id-ID')}</p>
                </div>
                <button 
                  type="button"
                  disabled={cart.length === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCheckout();
                  }}
                  className="w-full py-5 bg-sky-blue hover:bg-sky-400 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-[24px] font-black shadow-lg shadow-sky-blue/20 transition-all flex items-center justify-center gap-3 relative z-20"
                >
                  Bayar Sekarang <ArrowRight size={20} />
                </button>
                <p className="mt-4 text-[10px] text-center text-slate-400 font-medium leading-relaxed">
                  Pemesanan akan diproses melalui sistem saldo koperasi sekolah.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3 font-bold"
          >
            <CheckCircle2 size={24} /> Pesanan Berhasil Dikirim!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
