import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  Check,
  Percent,
  Sparkles,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer = ({ onProceedCheckout }) => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    itemsPrice,
    shippingPrice,
    taxPrice,
    discountPrice,
    totalPrice,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    couponError,
    clearCart,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (inputCoupon.trim()) {
      applyCoupon(inputCoupon.trim());
      setInputCoupon('');
    }
  };

  const freeShippingThreshold = 150;
  const progressPercent = Math.min(100, (itemsPrice / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - itemsPrice);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900/95 border-l border-slate-800 shadow-2xl backdrop-blur-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Shopping Bag</h2>
                <p className="text-xs text-slate-400">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cartItems.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-slate-400 hover:text-rose-400 px-2.5 py-1 rounded-lg hover:bg-slate-800 transition"
                  title="Clear Cart"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                aria-label="Close cart drawer"
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Free Shipping Progress Meter */}
          {cartItems.length > 0 && (
            <div className="px-5 py-3.5 bg-slate-950/70 border-b border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Truck className="w-4 h-4 text-indigo-400" />
                  {remainingForFreeShipping === 0 ? (
                    <span className="font-semibold text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Free Express Shipping Unlocked!
                    </span>
                  ) : (
                    <span>
                      Add <strong className="text-white">${remainingForFreeShipping.toFixed(2)}</strong> for{' '}
                      <strong className="text-indigo-400">Free Express Shipping</strong>
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold text-slate-400">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    remainingForFreeShipping === 0
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-glow-emerald'
                      : 'bg-gradient-to-r from-indigo-500 to-violet-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-4 text-slate-500 border border-slate-700/40">
                  <ShoppingBag className="w-8 h-8 text-indigo-400/60" />
                </div>
                <h3 className="text-base font-semibold text-slate-200 mb-1">Your cart is empty</h3>
                <p className="text-xs text-slate-400 max-w-xs mb-6">
                  Explore our premium tech, audio, and apparel to add products to your bag.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition active:scale-95"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.product}
                  className="flex gap-3.5 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover bg-slate-900 border border-slate-800 shrink-0"
                  />

                  {/* Item info */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-white truncate" title={item.name}>
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded-md hover:bg-slate-800 transition"
                          title="Remove item"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.category}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-bold text-white tracking-tight">
                        ${(item.price * item.qty).toFixed(2)}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product, item.qty - 1)}
                          aria-label="Decrease quantity"
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-white" aria-live="polite">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          disabled={item.countInStock !== undefined && item.qty >= item.countInStock}
                          onClick={() => updateQuantity(item.product, item.qty + 1)}
                          aria-label="Increase quantity"
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-slate-800/80 bg-slate-950/70 space-y-4">
              {/* Promo Code Input */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-xs">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300 font-medium">
                        Code <strong className="font-mono text-emerald-200">{appliedCoupon.code}</strong> applied ({appliedCoupon.label})
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-slate-400 hover:text-white text-xs underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Promo code (e.g. SAVE20)"
                          value={inputCoupon}
                          onChange={(e) => setInputCoupon(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 uppercase font-mono"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition"
                      >
                        Apply
                      </button>
                    </div>

                    {/* Quick Promo Chips */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 flex-wrap">
                      <span>Quick Apply:</span>
                      <button
                        type="button"
                        onClick={() => applyCoupon('SAVE20')}
                        className="px-2 py-0.5 rounded bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/30 font-mono transition"
                      >
                        SAVE20
                      </button>
                      <button
                        type="button"
                        onClick={() => applyCoupon('WELCOME10')}
                        className="px-2 py-0.5 rounded bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/30 font-mono transition"
                      >
                        WELCOME10
                      </button>
                      <button
                        type="button"
                        onClick={() => applyCoupon('FREESHIP')}
                        className="px-2 py-0.5 rounded bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/30 font-mono transition"
                      >
                        FREESHIP
                      </button>
                    </div>

                    {couponError && <p className="text-[11px] text-rose-400">{couponError}</p>}
                  </form>
                )}
              </div>

              {/* Cost Summary Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">${itemsPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shippingPrice === 0 ? (
                      <span className="text-emerald-400 font-semibold">FREE</span>
                    ) : (
                      `$${shippingPrice.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span>${taxPrice.toFixed(2)}</span>
                </div>
                {discountPrice > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Discount</span>
                    <span>-${discountPrice.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-slate-800 pt-2 flex justify-between text-base font-bold text-white">
                  <span>Total</span>
                  <span className="text-indigo-400">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedCheckout();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-glow transition active:scale-95"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-bit SSL encrypted &bull; 7-Day Money Back Guarantee</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
