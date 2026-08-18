import React from 'react';
import { Layers, ShieldCheck, Zap, RefreshCw, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-xl text-slate-400 text-xs">
      {/* Service Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-slate-800/60">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center gap-4 p-4 rounded-2xl glass-panel">
            <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Ultra Fast Shipping</h4>
              <p className="text-slate-400 text-xs">Orders dispatched within 24 hours with live tracking.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl glass-panel">
            <div className="p-3 rounded-xl bg-emerald-600/20 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Secure Checkout</h4>
              <p className="text-slate-400 text-xs">256-bit encrypted authentication & payments.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl glass-panel">
            <div className="p-3 rounded-xl bg-purple-600/20 text-purple-400">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">30-Day Money Back</h4>
              <p className="text-slate-400 text-xs">Hassle-free returns and responsive customer support.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-200">AURA Store</span>
          <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
        </div>

        <div className="flex items-center gap-4 text-slate-500">
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
            Node.js &bull; Express &bull; MongoDB &bull; React &bull; Tailwind
          </span>
        </div>
      </div>
    </footer>
  );
};
