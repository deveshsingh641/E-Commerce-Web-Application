import React, { useState } from 'react';
import {
  User,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const AuthPage = ({ onAuthSuccess }) => {
  const { login, register, loginDemoCustomer, loginDemoAdmin, loading, authError } = useAuth();
  const { showToast } = useCart();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [adminCode, setAdminCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'login') {
      const res = await login(email, password);
      if (res.success) {
        showToast(`Welcome back, ${res.data.name}!`, 'success');
        onAuthSuccess();
      }
    } else {
      const res = await register(name, email, password, role, adminCode);
      if (res.success) {
        showToast(`Account created! Welcome, ${res.data.name}`, 'success');
        onAuthSuccess();
      }
    }
  };

  const handleDemoCustomer = async () => {
    const res = await loginDemoCustomer();
    if (res.success) {
      showToast('Logged in as Demo Customer (Alex Johnson)', 'success');
      onAuthSuccess();
    }
  };

  const handleDemoAdmin = async () => {
    const res = await loginDemoAdmin();
    if (res.success) {
      showToast('Logged in as Demo Admin (Admin Manager)', 'success');
      onAuthSuccess();
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4 animate-in fade-in duration-300">
      <div className="rounded-3xl glass-panel p-8 border border-slate-800 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center mx-auto shadow-glow">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {mode === 'login' ? 'Sign In to Your Account' : 'Create an Account'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'login'
              ? 'Access your orders, cart, and personalized store features'
              : 'Join AURA Store to start ordering with express checkout'}
          </p>
        </div>

        {/* 1-Click Demo Logins for Instant Testing */}
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Instant 1-Click Evaluation Logins:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDemoCustomer}
              className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-200 hover:text-white border border-indigo-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Customer Demo</span>
            </button>
            <button
              type="button"
              onClick={handleDemoAdmin}
              className="py-2 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Demo</span>
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-lg transition ${
              mode === 'login' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2 rounded-lg transition ${
              mode === 'register' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {authError && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-medium text-center">
            {authError}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="user">Customer (Standard User)</option>
                  <option value="admin">Administrator (Requires Admin Secret Key)</option>
                </select>
              </div>

              {role === 'admin' && (
                <div className="space-y-1">
                  <label className="text-amber-300 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Admin Security Key
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter admin authorization key"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    className="w-full bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[10px] text-slate-400">
                    Admin access is restricted. Default dev key is <code className="text-amber-300 font-mono">AURA_ADMIN_SECRET_KEY</code>.
                  </p>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-glow flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-40"
          >
            <span>{loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
