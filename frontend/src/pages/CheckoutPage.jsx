import React, { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Banknote,
  PackageCheck,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const CheckoutPage = ({ onOrderPlaced, onGoBackToStore }) => {
  const {
    cartItems,
    itemsPrice,
    shippingPrice,
    taxPrice,
    discountPrice,
    totalPrice,
    appliedCoupon,
    clearCart,
  } = useCart();
  const { user, loginDemoCustomer } = useAuth();

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Success
  const [placedOrder, setPlacedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Shipping Form State
  const [shippingData, setShippingData] = useState({
    fullName: user?.name || 'Alex Johnson',
    email: user?.email || 'user@demo.com',
    phone: '+1 (555) 234-5678',
    street: user?.address?.street || '123 Market Street, Apt 4B',
    city: user?.address?.city || 'Seattle',
    state: user?.address?.state || 'WA',
    postalCode: user?.address?.postalCode || '98101',
    country: user?.address?.country || 'USA',
  });

  // Payment Form State
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardData, setCardData] = useState({
    number: '4242 •••• •••• 4242',
    name: user?.name || 'Alex Johnson',
    expiry: '12/28',
    cvv: '921',
  });

  const handleShippingChange = (e) => {
    setShippingData({ ...shippingData, [e.target.name]: e.target.value });
  };

  const handleNextToPayment = (e) => {
    e.preventDefault();
    if (!shippingData.fullName || !shippingData.street || !shippingData.city || !shippingData.postalCode) {
      setError('Please fill in all required shipping address fields');
      return;
    }
    setError('');
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      // If user isn't signed in, log in with demo customer or prompt
      await loginDemoCustomer();
    }

    setLoading(true);
    setError('');

    try {
      const orderPayload = {
        orderItems: cartItems.map((item) => ({
          product: item.product,
          name: item.name,
          qty: item.qty,
          image: item.image,
          price: item.price,
        })),
        shippingAddress: {
          fullName: shippingData.fullName,
          street: shippingData.street,
          city: shippingData.city,
          state: shippingData.state,
          postalCode: shippingData.postalCode,
          country: shippingData.country,
          phone: shippingData.phone,
        },
        paymentMethod:
          paymentMethod === 'credit_card'
            ? 'Credit Card (Visa **** 4242)'
            : paymentMethod === 'upi'
            ? 'UPI / Instant Bank Transfer'
            : 'Cash on Delivery (COD)',
        couponCode: appliedCoupon?.code || '',
        itemsPrice,
        taxPrice,
        shippingPrice,
        discountPrice,
        totalPrice,
      };

      const response = await api.createOrder(orderPayload);
      setPlacedOrder(response);
      clearCart();
      setStep(3);

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#a855f7', '#38bdf8'],
        });
      } catch (e) {
        console.error('Confetti error', e);
      }
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && step !== 3) {
    return (
      <div className="rounded-3xl glass-panel p-12 text-center max-w-md mx-auto space-y-4 my-12 animate-in fade-in">
        <PackageCheck className="w-16 h-16 text-indigo-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Your Cart is Empty</h2>
        <p className="text-xs text-slate-400">
          Add items to your cart before proceeding to checkout.
        </p>
        <button
          onClick={onGoBackToStore}
          className="px-6 py-3 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-glow"
        >
          Return to Store
        </button>
      </div>
    );
  }

  // Step 3: Success Confirmation Screen
  if (step === 3 && placedOrder) {
    return (
      <div className="max-w-2xl mx-auto py-8 animate-in zoom-in-95 duration-300 space-y-8">
        <div className="rounded-3xl glass-panel p-8 sm:p-12 text-center border border-emerald-500/30 space-y-6 relative overflow-hidden">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-glow-emerald">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Payment Confirmed & Verified
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Thank You for Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              Your order <strong className="text-white">#{placedOrder._id.slice(-8).toUpperCase()}</strong> has
              been recorded. A receipt and real-time tracking link have been generated.
            </p>
          </div>

          {/* Tracking badge */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left max-w-md mx-auto space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Tracking Number:</span>
              <span className="font-mono font-bold text-indigo-400">
                {placedOrder.trackingNumber}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Estimated Delivery:</span>
              <span className="font-semibold text-white">2 - 3 Business Days</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Total Paid:</span>
              <span className="font-bold text-emerald-400">
                ${placedOrder.totalPrice?.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => onOrderPlaced(placedOrder._id)}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-glow flex items-center justify-center gap-2 transition"
            >
              <span>Track Live Order Status</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onGoBackToStore}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-semibold transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Progress Steps Header */}
      <div className="flex items-center justify-center gap-4 text-xs font-semibold">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
            step === 1
              ? 'bg-indigo-600 text-white shadow-glow'
              : 'bg-slate-900/80 text-emerald-400 border border-slate-800'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-slate-950 flex items-center justify-center text-[10px]">
            1
          </span>
          <span>Shipping & Contact</span>
        </div>

        <div className="w-8 h-0.5 bg-slate-800" />

        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
            step === 2
              ? 'bg-indigo-600 text-white shadow-glow'
              : 'bg-slate-900/80 text-slate-500 border border-slate-800'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-slate-950 flex items-center justify-center text-[10px]">
            2
          </span>
          <span>Payment & Review</span>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-medium text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form Steps */}
        <div className="lg:col-span-2 space-y-6">
          {step === 1 ? (
            /* Step 1: Shipping Details */
            <form
              onSubmit={handleNextToPayment}
              className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Shipping Address</h2>
                    <p className="text-xs text-slate-400">Where should we deliver your order?</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Full Recipient Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingData.fullName}
                    onChange={handleShippingChange}
                    required
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Contact Phone *</label>
                  <input
                    type="text"
                    name="phone"
                    value={shippingData.phone}
                    onChange={handleShippingChange}
                    required
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Street Address *</label>
                  <input
                    type="text"
                    name="street"
                    value={shippingData.street}
                    onChange={handleShippingChange}
                    required
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingData.city}
                    onChange={handleShippingChange}
                    required
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">State / Province</label>
                  <input
                    type="text"
                    name="state"
                    value={shippingData.state}
                    onChange={handleShippingChange}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Postal / ZIP Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={shippingData.postalCode}
                    onChange={handleShippingChange}
                    required
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={shippingData.country}
                    onChange={handleShippingChange}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-slate-800">
                <button
                  type="button"
                  onClick={onGoBackToStore}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Store
                </button>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-glow flex items-center gap-2 transition"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            /* Step 2: Payment Options */
            <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Payment Method</h2>
                    <p className="text-xs text-slate-400">
                      All transactions are simulated and secured.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-2 transition ${
                    paymentMethod === 'credit_card'
                      ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-glow'
                      : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                  <span className="text-xs font-semibold">Credit / Debit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-2 transition ${
                    paymentMethod === 'upi'
                      ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-glow'
                      : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-purple-400" />
                  <span className="text-xs font-semibold">UPI / QR Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-2 transition ${
                    paymentMethod === 'cod'
                      ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-glow'
                      : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-semibold">Cash on Delivery</span>
                </button>
              </div>

              {/* Simulated Card Interface */}
              {paymentMethod === 'credit_card' && (
                <div className="p-5 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/80 border border-indigo-500/30 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-bold text-indigo-300">DEMO TEST CARD</span>
                    <span className="text-slate-400">Visa / Mastercard</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardData.number}
                        onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Expiry Date</label>
                        <input
                          type="text"
                          value={cardData.expiry}
                          onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">CVV / CVC</label>
                        <input
                          type="password"
                          value={cardData.cvv}
                          onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                  <div className="w-28 h-28 mx-auto bg-white p-2 rounded-xl flex items-center justify-center">
                    <QrCode className="w-24 h-24 text-slate-900" />
                  </div>
                  <p className="text-xs text-slate-300 font-mono">aurastore@okaxis</p>
                  <p className="text-[11px] text-slate-500">Scan using any UPI App (GPay, PhonePe, Paytm)</p>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-white">Cash on Delivery selected</p>
                  <p className="text-slate-400">
                    Pay with cash or card upon package arrival at your doorstep.
                  </p>
                </div>
              )}

              {/* Navigation Actions */}
              <div className="pt-4 flex justify-between items-center border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Shipping
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handlePlaceOrder}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold shadow-glow flex items-center gap-2 transition disabled:opacity-40"
                >
                  <Lock className="w-4 h-4" />
                  <span>{loading ? 'Processing Order...' : `Pay $${totalPrice.toFixed(2)}`}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Sticky Order Summary */}
        <div className="space-y-4">
          <div className="rounded-3xl glass-panel p-6 border border-slate-800 space-y-4 sticky top-24">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              Order Summary ({cartItems.length} items)
            </h3>

            {/* Items Mini List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.product} className="flex items-center gap-3 text-xs">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-800 bg-slate-900 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{item.name}</p>
                    <p className="text-slate-400">Qty: {item.qty}</p>
                  </div>
                  <span className="font-bold text-white shrink-0">
                    ${(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-slate-800 pt-3 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white font-medium">${itemsPrice.toFixed(2)}</span>
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
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>-${discountPrice.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-slate-800 pt-3 flex justify-between text-lg font-bold text-white">
                <span>Total</span>
                <span className="text-indigo-400">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Trust badge */}
            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>256-Bit SSL Encrypted & Protected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
