import React, { useState, useEffect } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
  ArrowLeft,
  Receipt,
  Printer,
  XCircle,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  Calendar,
  X,
  HelpCircle,
  CheckCircle,
  FileText,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { OrderTimeline } from '../components/OrderTimeline';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const OrdersPage = ({ selectedOrderId, onGoToStore }) => {
  const { user } = useAuth();
  const { showToast } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Cancellation Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Placed by mistake / wrong item or quantity');
  const [customCancelNotes, setCustomCancelNotes] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Return Modal State (7-Day Policy)
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('Item defective or damaged upon arrival');
  const [returnType, setReturnType] = useState('Refund to Original Payment');
  const [returnComments, setReturnComments] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getMyOrders();
      setOrders(data);
      if (selectedOrderId) {
        const match = data.find((o) => o._id === selectedOrderId);
        if (match) setActiveOrder(match);
      } else if (data.length > 0) {
        if (!activeOrder) {
          setActiveOrder(data[0]);
        } else {
          // sync active order with freshly fetched record
          const current = data.find((o) => o._id === activeOrder._id);
          if (current) setActiveOrder(current);
        }
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  // Handle Cancel Order
  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!activeOrder) return;
    setSubmittingAction(true);
    try {
      const fullReason = customCancelNotes.trim()
        ? `${cancelReason} - ${customCancelNotes.trim()}`
        : cancelReason;

      const updated = await api.cancelOrder(activeOrder._id, fullReason);
      showToast(`Order #${activeOrder._id.slice(-8).toUpperCase()} was successfully cancelled. Full refund initiated.`, 'success');
      setActiveOrder(updated);
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
      setIsCancelModalOpen(false);
      setCustomCancelNotes('');
    } catch (err) {
      showToast(err.message || 'Failed to cancel order', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handle Return Order (7-Day Policy)
  const handleConfirmReturn = async (e) => {
    e.preventDefault();
    if (!activeOrder) return;
    setSubmittingAction(true);
    try {
      const returnPayload = {
        reason: returnReason,
        returnType,
        comments: returnComments.trim(),
      };

      const updated = await api.returnOrder(activeOrder._id, returnPayload);
      showToast(`Return request submitted under 7-Day Policy for Order #${activeOrder._id.slice(-8).toUpperCase()}!`, 'success');
      setActiveOrder(updated);
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
      setIsReturnModalOpen(false);
      setReturnComments('');
    } catch (err) {
      showToast(err.message || 'Failed to submit return request', 'error');
    } finally {
      setSubmittingAction(false);
    }
  }; 

  if (!user) {
    return (
      <div className="rounded-3xl glass-panel p-12 text-center max-w-md mx-auto space-y-4 my-12 animate-in fade-in">
        <Package className="w-16 h-16 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Sign In to View Orders</h2>
        <p className="text-xs text-slate-400">
          Please sign in to access your order history, manage cancellations, and return eligible packages.
        </p>
      </div>
    );
  }

  // Active Order Policy Calculations
  const isCancellable =
    activeOrder && ['Pending', 'Confirmed', 'Processing'].includes(activeOrder.status);

  const deliveryDate =
    activeOrder?.deliveredAt || activeOrder?.updatedAt || activeOrder?.createdAt;
  const elapsedDays =
    activeOrder?.status === 'Delivered'
      ? (Date.now() - new Date(deliveryDate).getTime()) / (1000 * 60 * 60 * 24)
      : 999;
  const isReturnEligible = activeOrder?.status === 'Delivered' && elapsedDays <= 7;
  const isReturnExpired = activeOrder?.status === 'Delivered' && elapsedDays > 7;
  const returnDaysRemaining = Math.max(0, Math.ceil(7 - elapsedDays));

  // Filter orders by search query and fulfillment status
  const filteredOrders = orders.filter((o) => {
    const q = orderSearchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      o._id.toLowerCase().includes(q) ||
      o.trackingNumber?.toLowerCase().includes(q) ||
      o.orderItems?.some((item) => item.name?.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (orderStatusFilter === 'In Transit') {
      return ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery'].includes(o.status);
    }
    if (orderStatusFilter === 'Delivered') {
      return o.status === 'Delivered';
    }
    if (orderStatusFilter === 'Cancelled') {
      return ['Cancelled', 'Return Requested', 'Returned'].includes(o.status);
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Package className="w-7 h-7 text-indigo-400" />
            My Orders & Tracking
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track parcels in real-time, cancel wrongly placed orders, or return items within our 7-Day Guarantee policy.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 rounded-2xl glass-panel animate-pulse bg-slate-900/40" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl glass-panel p-12 text-center max-w-md mx-auto space-y-4 my-8">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/60 mx-auto flex items-center justify-center text-slate-500">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No orders placed yet</h3>
          <p className="text-xs text-slate-400">
            When you complete a purchase, your order history, cancellation options, and return window will appear here.
          </p>
          <button
            onClick={onGoToStore}
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-glow"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 1 Col: Orders History List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Order History ({filteredOrders.length})
              </h3>
            </div>

            {/* Search Input for Orders */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tracking, order ID, items..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-7 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {orderSearchQuery && (
                <button
                  onClick={() => setOrderSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              {['All', 'In Transit', 'Delivered', 'Cancelled'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setOrderStatusFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                    orderStatusFilter === tab
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {tab === 'Cancelled' ? 'Cancelled / Returned' : tab}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="p-6 rounded-2xl glass-panel text-center text-xs text-slate-400 space-y-2">
                <p>No orders match your filter criteria.</p>
                <button
                  onClick={() => {
                    setOrderSearchQuery('');
                    setOrderStatusFilter('All');
                  }}
                  className="text-indigo-400 hover:underline text-xs"
                >
                  Clear search & filters
                </button>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isSelected = activeOrder?._id === order._id;
                const totalItems = order.orderItems?.reduce((acc, i) => acc + i.qty, 0) || 0;

                return (
                  <div
                    key={order._id}
                    onClick={() => setActiveOrder(order)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-glow'
                        : 'glass-panel border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-white">
                      #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        order.status === 'Cancelled'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : order.status === 'Return Requested'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : order.status === 'Returned'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : order.status === 'Delivered'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : order.status === 'Shipped' || order.status === 'Out for Delivery'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2 overflow-hidden">
                    {order.orderItems?.slice(0, 3).map((item, idx) => (
                      <img
                        key={idx}
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-900 border border-slate-800 shrink-0"
                      />
                    ))}
                    {order.orderItems?.length > 3 && (
                      <span className="text-[11px] text-slate-500">
                        +{order.orderItems.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                    <span>
                      {new Date(order.createdAt).toLocaleDateString()} &bull; {totalItems} items
                    </span>
                    <span className="font-bold text-white">${order.totalPrice?.toFixed(2)}</span>
                  </div>
                </div>
              );
            }))}
          </div>

          {/* Right 2 Cols: Active Order Timeline & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {activeOrder ? (
              <div className="space-y-6">
                {/* Action Card: Cancel / Return Policy Options */}
                <div className="rounded-2xl glass-panel p-5 border border-slate-800 bg-slate-950/40">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-sm font-bold text-white">Order Management & Protection</h3>
                      </div>
                      <p className="text-xs text-slate-400">
                        {isCancellable && 'Wrongly placed order? Cancel freely before delivery to receive a full refund.'}
                        {isReturnEligible && `Delivered package is covered by our 7-Day Return Policy (${returnDaysRemaining} days remaining).`}
                        {isReturnExpired && 'This order was delivered more than 7 days ago and the return window has expired.'}
                        {activeOrder.status === 'Cancelled' && 'This order is cancelled. Funds have been returned to your original payment.'}
                        {activeOrder.status === 'Return Requested' && 'Your return request is currently being processed under the 7-day policy.'}
                        {activeOrder.status === 'Returned' && 'Return completed. Full refund/store credit has been processed.'}
                        {['Shipped', 'Out for Delivery'].includes(activeOrder.status) && 'Package is in transit. If wrongly ordered, you can return it upon delivery under our 7-day policy.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Cancel Order Button */}
                      {isCancellable && (
                        <button
                          onClick={() => setIsCancelModalOpen(true)}
                          className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-2 transition shadow-sm hover:border-rose-500/50"
                        >
                          <XCircle className="w-4 h-4 text-rose-400" />
                          Cancel Order
                        </button>
                      )}

                      {/* Return Order Button (7-Day Policy Active) */}
                      {isReturnEligible && (
                        <button
                          onClick={() => setIsReturnModalOpen(true)}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-glow"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Return Order ({returnDaysRemaining}d left)
                        </button>
                      )}

                      {/* Return Expired Tag */}
                      {isReturnExpired && (
                        <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs font-medium flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          7-Day Return Closed
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timeline Card */}
                <OrderTimeline order={activeOrder} />

                {/* Items in Order */}
                <div className="rounded-2xl glass-panel p-6 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white">Items in this Package</h3>
                    <button
                      onClick={() => setIsInvoiceModalOpen(true)}
                      className="text-xs text-indigo-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 hover:bg-indigo-900/50 transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      View & Print Invoice
                    </button>
                  </div>

                  <div className="space-y-3">
                    {activeOrder.orderItems?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-950/50 border border-slate-800"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover bg-slate-900 border border-slate-800 shrink-0"
                          />
                          <div>
                            <p className="text-xs font-semibold text-white">{item.name}</p>
                            <p className="text-[11px] text-slate-400">Qty: {item.qty} &times; ${item.price?.toFixed(2)}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-white">
                          ${(item.price * item.qty).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Financial Breakdown */}
                  <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span>Items Subtotal</span>
                      <span className="text-white">${activeOrder.itemsPrice?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping Fee</span>
                      <span>
                        {activeOrder.shippingPrice === 0
                          ? 'FREE'
                          : `$${activeOrder.shippingPrice?.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Taxes</span>
                      <span>${activeOrder.taxPrice?.toFixed(2)}</span>
                    </div>
                    {activeOrder.discountPrice > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Promotional Discount</span>
                        <span>-${activeOrder.discountPrice?.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-bold text-white">
                      <span>Grand Total</span>
                      <span className="text-indigo-400">${activeOrder.totalPrice?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl glass-panel text-center text-slate-400 text-xs">
                Select an order from the list to view live tracking and order options.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. CANCEL ORDER MODAL */}
      {/* ========================================================================= */}
      {isCancelModalOpen && activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl glass-modal border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Cancel Order #{activeOrder._id.slice(-8).toUpperCase()}</h3>
                  <p className="text-[11px] text-slate-400">Easily cancel wrongly placed orders with instant refund</p>
                </div>
              </div>
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-200">
                Cancelling will release all reserved inventory and automatically issue a full refund of <strong className="text-white">${activeOrder.totalPrice?.toFixed(2)}</strong>.
              </p>
            </div>

            <form onSubmit={handleConfirmCancel} className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="text-slate-300 font-semibold block">
                  Please select reason for cancellation *
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:border-rose-500 focus:outline-none"
                >
                  <option value="Placed by mistake / wrong item or quantity">
                    Placed by mistake / wrong item or quantity
                  </option>
                  <option value="Need to change shipping address or payment">
                    Need to change shipping address or payment
                  </option>
                  <option value="Found better price / promo discount elsewhere">
                    Found better price / promo discount elsewhere
                  </option>
                  <option value="Accidental duplicate order">
                    Accidental duplicate order
                  </option>
                  <option value="Delivery time is longer than required">
                    Delivery time is longer than required
                  </option>
                  <option value="Other / Changed mind">
                    Other / Changed mind
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium block">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={customCancelNotes}
                  onChange={(e) => setCustomCancelNotes(e.target.value)}
                  placeholder="Explain what went wrong or any feedback..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-glow-rose flex items-center gap-2 transition disabled:opacity-50"
                >
                  {submittingAction ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. RETURN ORDER MODAL (7-DAY POLICY) */}
      {/* ========================================================================= */}
      {isReturnModalOpen && activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl glass-modal border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">7-Day Policy: Return Order #{activeOrder._id.slice(-8).toUpperCase()}</h3>
                  <p className="text-[11px] text-slate-400">Aura Guarantee &bull; {returnDaysRemaining} day(s) left to return</p>
                </div>
              </div>
              <button
                onClick={() => setIsReturnModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Policy Info Card */}
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>7-Day Return & Satisfaction Guarantee</span>
              </div>
              <p className="text-[11px] text-purple-200/80 leading-relaxed">
                You can return any delivered product within 7 calendar days of receipt. We provide prepaid return labels and prompt refunds to your original payment method.
              </p>
            </div>

            <form onSubmit={handleConfirmReturn} className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="text-slate-300 font-semibold block">
                  Why are you returning this order? *
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="Item defective or damaged upon arrival">
                    Item defective or damaged upon arrival
                  </option>
                  <option value="Wrong item or size received">
                    Wrong item or size received
                  </option>
                  <option value="Item not as described / pictured">
                    Item not as described / pictured
                  </option>
                  <option value="Quality not satisfactory">
                    Quality not satisfactory
                  </option>
                  <option value="Ordered by mistake / wrongly placed">
                    Ordered by mistake / wrongly placed
                  </option>
                  <option value="Other reason">
                    Other reason
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 font-semibold block">
                  Preferred Resolution *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition ${
                      returnType === 'Refund to Original Payment'
                        ? 'bg-purple-950/40 border-purple-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="returnType"
                      value="Refund to Original Payment"
                      checked={returnType === 'Refund to Original Payment'}
                      onChange={(e) => setReturnType(e.target.value)}
                      className="hidden"
                    />
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      returnType === 'Refund to Original Payment' ? 'border-purple-400 bg-purple-500' : 'border-slate-600'
                    }`}>
                      {returnType === 'Refund to Original Payment' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="font-medium text-xs">Refund to Original Card / PayPal</span>
                  </label>

                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition ${
                      returnType === 'Store Credit / Exchange'
                        ? 'bg-purple-950/40 border-purple-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="returnType"
                      value="Store Credit / Exchange"
                      checked={returnType === 'Store Credit / Exchange'}
                      onChange={(e) => setReturnType(e.target.value)}
                      className="hidden"
                    />
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      returnType === 'Store Credit / Exchange' ? 'border-purple-400 bg-purple-500' : 'border-slate-600'
                    }`}>
                      {returnType === 'Store Credit / Exchange' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="font-medium text-xs">Store Credit / Replacement</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium block">
                  Describe the issue or comments
                </label>
                <textarea
                  rows={3}
                  value={returnComments}
                  onChange={(e) => setReturnComments(e.target.value)}
                  placeholder="Provide additional details regarding package condition..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-glow flex items-center gap-2 transition disabled:opacity-50"
                >
                  {submittingAction ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="w-3.5 h-3.5" />
                  )}
                  Submit Return Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Official Invoice Modal */}
      {isInvoiceModalOpen && activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Action Bar for Modal (hidden in print) */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 print:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Official Order Invoice
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save as PDF
                </button>
                <button
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div className="space-y-6">
              {/* Brand & Invoice Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-slate-950 tracking-tight">AURA STORE</h2>
                  <p className="text-xs text-slate-500">Premium Audio, Tech & Lifestyle</p>
                  <p className="text-xs text-slate-500">support@aurastore.com &bull; www.aurastore.com</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-indigo-600 px-2.5 py-1 rounded bg-indigo-50 border border-indigo-200">
                    INVOICE
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-2 font-mono">
                    #{activeOrder._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-slate-500">
                    Date: {new Date(activeOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Bill To & Order Summary */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                    Billed & Shipped To:
                  </h4>
                  <p className="font-bold text-slate-900">{activeOrder.shippingAddress?.fullName}</p>
                  <p className="text-slate-600">{activeOrder.shippingAddress?.street}</p>
                  <p className="text-slate-600">
                    {activeOrder.shippingAddress?.city}, {activeOrder.shippingAddress?.state}{' '}
                    {activeOrder.shippingAddress?.postalCode}
                  </p>
                  <p className="text-slate-600">{activeOrder.shippingAddress?.country}</p>
                  <p className="text-slate-600 mt-1">Tel: {activeOrder.shippingAddress?.phone}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                    Order Information:
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tracking Number:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {activeOrder.trackingNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Method:</span>
                    <span className="font-medium text-slate-900">{activeOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-bold text-slate-900">{activeOrder.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Status:</span>
                    <span className="font-bold text-emerald-600">Paid in Full</span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Item Description</th>
                      <th className="py-2.5 px-4 text-center">Qty</th>
                      <th className="py-2.5 px-4 text-right">Price</th>
                      <th className="py-2.5 px-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeOrder.orderItems?.map((item, idx) => (
                      <tr key={idx} className="text-slate-800">
                        <td className="py-3 px-4 font-medium">{item.name}</td>
                        <td className="py-3 px-4 text-center">{item.qty}</td>
                        <td className="py-3 px-4 text-right">${item.price?.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-bold">
                          ${(item.price * item.qty).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Price Breakdown */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium text-slate-900">
                      ${activeOrder.itemsPrice?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span className="font-medium text-slate-900">
                      {activeOrder.shippingPrice === 0 ? 'FREE' : `$${activeOrder.shippingPrice?.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%):</span>
                    <span className="font-medium text-slate-900">
                      ${activeOrder.taxPrice?.toFixed(2)}
                    </span>
                  </div>
                  {activeOrder.discountPrice > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Discount:</span>
                      <span>-${activeOrder.discountPrice?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-300 pt-2 flex justify-between text-sm font-bold text-slate-950">
                    <span>Grand Total:</span>
                    <span className="text-indigo-600">${activeOrder.totalPrice?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Footer Notice */}
              <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-500">
                <p>All delivered items are eligible for return under our 7-Day Guarantee Policy.</p>
                <p className="mt-0.5">Thank you for your business with AURA Store!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
