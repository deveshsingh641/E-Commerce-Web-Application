import React from 'react';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  CheckCheck,
  CircleDot,
} from 'lucide-react';

export const OrderTimeline = ({ order }) => {
  if (!order) return null;

  const getStepIcon = (index, completed, isCurrent) => {
    if (completed) {
      return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    }
    if (isCurrent) {
      return <CircleDot className="w-5 h-5 text-indigo-400 animate-pulse" />;
    }
    return <Clock className="w-4 h-4 text-slate-500" />;
  };

  const timeline = order.timeline || [
    { title: 'Order Placed', description: 'Order confirmed and placed', completed: true, timestamp: order.createdAt },
    { title: 'Payment Confirmed', description: 'Transaction verified', completed: order.isPaid, timestamp: order.paidAt },
    { title: 'Processing & Packed', description: 'Item packed in fulfillment center', completed: ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'].includes(order.status) },
    { title: 'Shipped & In Transit', description: 'Package handed over to carrier', completed: ['Shipped', 'Out for Delivery', 'Delivered'].includes(order.status) },
    { title: 'Out for Delivery', description: 'Courier is en route to address', completed: ['Out for Delivery', 'Delivered'].includes(order.status) },
    { title: 'Delivered', description: 'Delivered to recipient', completed: order.status === 'Delivered', timestamp: order.deliveredAt },
  ];

  // Find current active step index
  let activeIndex = 0;
  for (let i = timeline.length - 1; i >= 0; i--) {
    if (timeline[i].completed) {
      activeIndex = i;
      break;
    }
  }

  return (
    <div className="rounded-2xl glass-panel p-6 border border-slate-800">
      {/* Header with Tracking info */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Live Order Tracking
          </span>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Order #{order._id.slice(-8).toUpperCase()}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {order.trackingNumber && (
            <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 font-mono">
              Tracking: <span className="text-white font-bold">{order.trackingNumber}</span>
            </div>
          )}
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              order.status === 'Delivered'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : order.status === 'Shipped' || order.status === 'Out for Delivery'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            {order.status}
          </span>
        </div>
      </div>

      {/* Progress Line */}
      <div className="mt-8 relative">
        {/* Timeline Items */}
        <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {timeline.map((step, idx) => {
            const isCompleted = step.completed;
            const isCurrent = idx === activeIndex && order.status !== 'Delivered';

            return (
              <div key={idx} className="relative flex items-start gap-4 group">
                {/* Node icon */}
                <div
                  className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted
                      ? 'bg-slate-950 border-emerald-500 shadow-glow-emerald text-emerald-400'
                      : isCurrent
                      ? 'bg-slate-950 border-indigo-500 shadow-glow text-indigo-400 animate-pulse'
                      : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}
                >
                  {getStepIcon(idx, isCompleted, isCurrent)}
                </div>

                <div className="flex-1 ml-3">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-sm font-semibold transition ${
                        isCompleted
                          ? 'text-white'
                          : isCurrent
                          ? 'text-indigo-300 font-bold'
                          : 'text-slate-500'
                      }`}
                    >
                      {step.title}
                    </h4>
                    {step.timestamp && (
                      <span className="text-[11px] text-slate-500">
                        {new Date(step.timestamp).toLocaleDateString()} &bull;{' '}
                        {new Date(step.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-xs mt-0.5 ${
                      isCompleted ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shipping Address Summary */}
      {order.shippingAddress && (
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 font-medium block mb-1">Destination Address:</span>
            <p className="font-semibold text-white">{order.shippingAddress.fullName}</p>
            <p className="text-slate-300">{order.shippingAddress.street}</p>
            <p className="text-slate-300">
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </p>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-slate-500 font-medium block mb-1">Payment Method:</span>
              <p className="font-semibold text-white">{order.paymentMethod}</p>
            </div>
            <div className="flex justify-between items-end pt-2">
              <span className="text-slate-400">Total Charged:</span>
              <span className="text-sm font-bold text-indigo-400">
                ${order.totalPrice?.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
