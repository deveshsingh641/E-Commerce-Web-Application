import React, { useState } from 'react';
import {
  ShoppingBag,
  User,
  ShieldCheck,
  Package,
  Sparkles,
  LogOut,
  ChevronDown,
  Layers,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar = ({ currentTab, setCurrentTab, searchQuery, setSearchQuery }) => {
  const { user, isAdmin, logout, loginDemoCustomer, loginDemoAdmin } = useAuth();
  const { totalItemsCount, setIsCartOpen } = useCart();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
      {/* Top Demo Bar for easy switcher */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/40 border-b border-indigo-500/20 text-xs py-1.5 px-4 sm:px-8 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Full-Stack Store &bull; Role-Based Access:</span>
          <span className="font-semibold text-white">
            {user ? `${user.name} (${user.role.toUpperCase()})` : 'Guest'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 hidden sm:inline">1-Click Test:</span>
          <button
            onClick={() => {
              loginDemoCustomer();
              setCurrentTab('catalog');
            }}
            className="px-2.5 py-0.5 rounded-full bg-slate-800 hover:bg-indigo-600/80 text-indigo-200 hover:text-white border border-indigo-500/30 transition text-xs font-medium"
            title="Log in as demo Customer"
          >
            👤 Demo Customer
          </button>
          <button
            onClick={() => {
              loginDemoAdmin();
              setCurrentTab('admin');
            }}
            className="px-2.5 py-0.5 rounded-full bg-slate-800 hover:bg-emerald-600/80 text-emerald-200 hover:text-white border border-emerald-500/30 transition text-xs font-medium"
            title="Log in as demo Admin"
          >
            🛡️ Demo Admin
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <button
            onClick={() => setCurrentTab('catalog')}
            className="flex items-center gap-2.5 group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-300">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
                AURA<span className="text-indigo-400 text-xs px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/30 rounded">STORE</span>
              </span>
              <p className="text-[10px] text-slate-400 -mt-1 font-medium tracking-wider uppercase">
                Premium E-Commerce
              </p>
            </div>
          </button>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products, brands, gear..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentTab('catalog')}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
                currentTab === 'catalog'
                  ? 'bg-indigo-600 text-white shadow-glow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Store</span>
            </button>

            {user && (
              <button
                onClick={() => setCurrentTab('orders')}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
                  currentTab === 'orders'
                    ? 'bg-indigo-600 text-white shadow-glow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">My Orders</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
                  currentTab === 'admin'
                    ? 'bg-emerald-600 text-white shadow-glow-emerald'
                    : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-500/20'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Panel</span>
              </button>
            )}

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-slate-200 hover:text-white transition group"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform text-indigo-400" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-[11px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center shadow-lg border border-slate-950 animate-pulse">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* User Account / Auth Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-slate-200 transition"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg object-cover border border-indigo-500/30"
                  />
                  <span className="text-xs font-medium max-w-[100px] truncate hidden md:inline">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl glass-modal py-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-800">
                      <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <span className={`inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        user.role === 'admin' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}>
                        {user.role} Role
                      </span>
                    </div>

                    <button
                      onClick={() => setCurrentTab('orders')}
                      className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800/80 hover:text-white flex items-center gap-2"
                    >
                      <Package className="w-3.5 h-3.5 text-indigo-400" />
                      My Orders & Tracking
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => setCurrentTab('admin')}
                        className="w-full text-left px-4 py-2 text-xs text-emerald-400 hover:bg-emerald-950/40 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Admin Dashboard
                      </button>
                    )}

                    <div className="border-t border-slate-800 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setCurrentTab('catalog');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/30 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setCurrentTab('auth')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-glow transition flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
