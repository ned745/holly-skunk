'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, ShieldAlert, Lock, Unlock, RefreshCw, Key, ShoppingCart, Trash2, X, ShieldCheck } from 'lucide-react';

interface Product {
  name: string;
  price: number;
  category: string;
  description: string;
  stock: number;
  image?: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function StorefrontHome() {
  const [activeTab, setActiveTab] = useState<'fashion' | 'premium'>('fashion');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State Management Hooks
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem('hs_token'));
    setUserRole(localStorage.getItem('hs_role'));
  }, []);

  const fetchCatalog = useCallback(async (tab: 'fashion' | 'premium') => {
    setLoading(true);
    setError('');
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      const savedToken = localStorage.getItem('hs_token');
      if (savedToken) headers['Authorization'] = `Bearer ${savedToken}`;
      
      const res = await fetch(`http://localhost:5000/api/products/${tab}`, { headers });
      const json = await res.json();
      if (json.success) setProducts(json.data);
      else setError(json.error || 'Failed to fetch catalog.');
    } catch {
      setError('Could not connect to the backend server engine on Port 5000.');
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { 
    fetchCatalog(activeTab); 
  }, [activeTab, token, fetchCatalog]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        const role = data.user?.role || data.role || 'Admin';

        localStorage.setItem('hs_token', data.token);
        localStorage.setItem('hs_role', role);
        setToken(data.token);
        setUserRole(role);
        setUsername('');
        setPassword('');
      } else {
        setError(data.error || 'Auth failed.');
      }
    } catch { 
      setError('Auth server unreachable.'); 
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hs_token');
    localStorage.removeItem('hs_role');
    setToken(null);
    setUserRole(null);
  };

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const match = prev.find((i) => i.name === p.name);
      if (match) return prev.map((i) => i.name === p.name ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...p, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="min-h-screen bg-neutral-950 font-sans text-neutral-100 relative">
      <header className="border-b border-neutral-900 bg-neutral-950/80 sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <span className="text-2xl font-black tracking-tighter text-lime-400">HOLLY SKUNK</span>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsCartOpen(false)} className="relative p-2 text-neutral-400 hover:text-white transition-colors">
            <ShoppingCart size={20} onClick={() => setIsCartOpen(true)} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-lime-400 text-black text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {token ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-400 font-mono">
                Role: <strong className="text-lime-400">{userRole || 'Admin'}</strong>
              </span>

              {userRole === 'Admin' && (
                <a 
                  href="/admin" 
                  className="text-xs bg-lime-950 text-lime-400 border border-lime-900 px-3 py-1.5 rounded hover:bg-lime-900 transition-all font-mono flex items-center gap-1.5"
                >
                  <ShieldCheck size={14} /> Admin Dashboard
                </a>
              )}

              <button onClick={handleLogout} className="text-xs bg-red-950 text-red-400 border border-red-900 px-3 py-1.5 rounded hover:bg-red-900 hover:text-white transition-all">
                Logout
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="flex gap-2">
              <input type="text" placeholder="User / Email" value={username} onChange={e => setUsername(e.target.value)} className="bg-neutral-900 border border-neutral-800 px-2.5 py-1 text-xs rounded text-white focus:outline-none focus:border-lime-400" />
              <input type="password" placeholder="Pass" value={password} onChange={e => setPassword(e.target.value)} className="bg-neutral-900 border border-neutral-800 px-2.5 py-1 text-xs rounded text-white focus:outline-none focus:border-lime-400" />
              <button type="submit" className="bg-lime-400 text-black px-3 py-1 text-xs font-bold rounded hover:bg-lime-300 transition-colors">
                Login
              </button>
            </form>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex border-b border-neutral-900 mb-8 gap-6">
          <button onClick={() => setActiveTab('fashion')} className={`pb-3 text-xs font-mono uppercase tracking-wider transition-colors ${activeTab === 'fashion' ? 'text-lime-400 border-b-2 border-lime-400 font-bold' : 'text-neutral-500 hover:text-neutral-300'}`}>
            Streetwear
          </button>
          <button onClick={() => setActiveTab('premium')} className={`pb-3 text-xs font-mono uppercase tracking-wider transition-colors ${activeTab === 'premium' ? 'text-amber-400 border-b-2 border-amber-400 font-bold' : 'text-neutral-500 hover:text-neutral-300'}`}>
            Premium Portal
          </button>
        </div>

        {activeTab === 'premium' && (
          <div className="mb-6 p-4 rounded-xl border bg-amber-950/20 border-amber-900/50 text-xs text-amber-300 flex items-center gap-2">
            {userRole === 'Admin' ? '🛡️ ADMINISTRATIVE ACCESS SECURED' : '⚠️ REGISTRATION ACCESS LEVEL LOCKED: Please log in using an Admin profile status.'}
          </div>
        )}

        {error && <div className="p-4 bg-red-950/40 border border-red-900/60 rounded-xl text-xs text-red-400 mb-6">{error}</div>}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-neutral-500 text-xs font-mono gap-2">
            <RefreshCw size={16} className="animate-spin text-lime-400" />
            LOADING HOLLY SKUNK CATALOG...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((item, index) => (
              <div key={index} className="bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-neutral-700 transition-colors">
                {/* Product Image Container */}
                <div className="w-full h-56 bg-neutral-950 relative overflow-hidden border-b border-neutral-800">
                  <img 
                    src={item.image || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1000&auto=format&fit=crop'} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-5 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-100">{item.name}</h3>
                    <p className="text-xs text-neutral-400 mt-2 leading-relaxed">{item.description}</p>
                  </div>
                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-neutral-800/50">
                    <span className="text-sm font-bold text-neutral-200">${item.price.toFixed(2)}</span>
                    <button onClick={() => addToCart(item)} className="bg-lime-400 text-black px-3 py-1.5 text-xs font-bold rounded hover:bg-lime-300 transition-colors">
                      Add to Bag
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* --- SIDE DRAWER CART PANEL --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-80 bg-neutral-900 border-l border-neutral-800 p-6 flex flex-col justify-between z-10 shadow-2xl">
            <div>
              <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
                <h2 className="font-bold text-sm tracking-wider">YOUR BAG</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-neutral-400 hover:text-white"><X size={18} /></button>
              </div>
              {cart.length === 0 ? (
                <p className="text-xs text-neutral-500">Cart is empty.</p>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {cart.map((i, idx) => (
                    <div key={idx} className="flex justify-between text-xs items-center border-b border-neutral-800/40 pb-3">
                      <div>
                        <p className="font-bold text-neutral-200">{i.name}</p>
                        <p className="text-neutral-500 mt-0.5">${i.price.toFixed(2)} x {i.quantity}</p>
                      </div>
                      <button onClick={() => setCart(c => c.filter(x => x.name !== i.name))} className="text-neutral-500 hover:text-red-400 p-1 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-neutral-800 pt-4">
              <div className="flex justify-between text-sm font-bold mb-4">
                <span>Total:</span>
                <span className="text-lime-400">${cartTotal.toFixed(2)}</span>
              </div>
              <button className="w-full bg-lime-400 text-black py-2.5 rounded text-xs font-bold uppercase tracking-wider hover:bg-lime-300 transition-colors">
                Lock Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}