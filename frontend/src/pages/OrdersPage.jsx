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
} from 'lucide-react';
import { OrderTimeline } from '../components/OrderTimeline';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const OrdersPage = ({ selectedOrderId, onGoToStore }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getMyOrders();
      setOrders(data);
      if (selectedOrderId) {
        const match = data.find((o) => o._id === selectedOrderId);
        if (match) setActiveOrder(match);
      } else if (data.length > 0 && !activeOrder) {
        setActiveOrder(data[0]);
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

  if (!user) {
    return (
      <div className="rounded-3xl glass-panel p-12 text-center max-w-md mx-auto space-y-4 my-12 animate-in fade-in">
        <Package className="w-16 h-16 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Sign In to View Orders</h2>
        <p className="text-xs text-slate-400">
          Please sign in to access your order history and live parcel tracking.
        </p>
      </div>
    );
  }

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
            Track real-time shipment status, milestones, and download past invoices.
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
            When you complete a purchase, your order history and milestone timeline will appear here.
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Order History ({orders.length})
            </h3>

            {orders.map((order) => {
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
                        order.status === 'Delivered'
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
            })}
          </div>

          {/* Right 2 Cols: Active Order Timeline & Itemized Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            {activeOrder ? (
              <div className="space-y-6">
                {/* Timeline Card */}
                <OrderTimeline order={activeOrder} />

                {/* Items in Order */}
                <div className="rounded-2xl glass-panel p-6 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white">Items in this Package</h3>
                    <button
                      onClick={() => window.print()}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition"
                    >
                      <Printer className="w-3.5 h-3.5 text-indigo-400" />
                      Print Receipt
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
                Select an order from the list to view live tracking milestones.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
