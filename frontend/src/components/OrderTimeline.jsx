import React from 'react';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  CheckCheck,
  CircleDot,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Info,
} from 'lucide-react';

export const OrderTimeline = ({ order }) => {
  if (!order) return null;

  const isCancelled = order.status === 'Cancelled';
  const isReturnRequested = order.status === 'Return Requested';
  const isReturned = order.status === 'Returned';

  const getStepIcon = (step, index, completed, isCurrent) => {
    if (step.title.includes('Cancelled') || isCancelled) {
      return <XCircle className="w-5 h-5 text-rose-400" />;
    }
    if (step.title.includes('Return') || isReturnRequested || isReturned) {
      return <RotateCcw className="w-4 h-4 text-purple-400" />;
    }
    if (completed) {
      return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    }
    if (isCurrent) {
      return <CircleDot className="w-5 h-5 text-indigo-400 animate-pulse" />;
    }
    return <Clock className="w-4 h-4 text-slate-500" />;
  };

  const timeline = order.timeline && order.timeline.length > 0
    ? order.timeline
    : [
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

  const getStatusBadge = () => {
    if (order.status === 'Cancelled') {
      return 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
    }
    if (order.status === 'Return Requested') {
      return 'bg-purple-500/20 text-purple-300 border border-purple-500/40';
    }
    if (order.status === 'Returned') {
      return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
    }
    if (order.status === 'Delivered') {
      return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
    }
    if (order.status === 'Shipped' || order.status === 'Out for Delivery') {
      return 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40';
    }
    return 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
  };

  return (
    <div className="rounded-2xl glass-panel p-6 border border-slate-800 space-y-6">
      {/* Header with Tracking info */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
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
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge()}`}>
            {order.status}
          </span>
        </div>
      </div>

      {/* Special Notice Banner for Cancelled / Return */}
      {isCancelled && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-rose-200">Order Was Cancelled</p>
            <p className="text-rose-300/80">
              Reason: <span className="italic text-white font-medium">{order.cancelReason || 'Customer requested cancellation'}</span>
            </p>
            {order.cancelledAt && (
              <p className="text-[11px] text-rose-400">
                Cancelled on: {new Date(order.cancelledAt).toLocaleString()} &bull; Payment refunded to original method
              </p>
            )}
          </div>
        </div>
      )}

      {isReturnRequested && (
        <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-start gap-3">
          <RotateCcw className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-purple-200">7-Day Policy: Return Requested</p>
            <p className="text-purple-300/80">
              Reason: <span className="italic text-white font-medium">{order.returnReason}</span>
            </p>
            <p className="text-purple-300/80">
              Selected Resolution: <span className="text-white font-semibold">{order.returnType || 'Refund to Original Payment'}</span>
            </p>
            {order.returnRequestedAt && (
              <p className="text-[11px] text-purple-400">
                Initiated on: {new Date(order.returnRequestedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      )}

      {isReturned && (
        <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-3">
          <CheckCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-cyan-200">Return Completed & Refund Processed</p>
            <p className="text-cyan-300/80">
              The item was safely returned under the 7-Day policy. Refund/Exchange has been issued.
            </p>
          </div>
        </div>
      )}

      {/* Progress Line */}
      <div className="relative pt-2">
        {/* Timeline Items */}
        <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {timeline.map((step, idx) => {
            const isCompleted = step.completed;
            const isCurrent = idx === activeIndex && !['Delivered', 'Cancelled', 'Returned'].includes(order.status);
            const isStepCancelled = step.title.includes('Cancelled');
            const isStepReturn = step.title.includes('Return');

            return (
              <div key={idx} className="relative flex items-start gap-4 group">
                {/* Node icon */}
                <div
                  className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                    isStepCancelled
                      ? 'bg-slate-950 border-rose-500 shadow-glow text-rose-400'
                      : isStepReturn
                      ? 'bg-slate-950 border-purple-500 shadow-glow text-purple-400'
                      : isCompleted
                      ? 'bg-slate-950 border-emerald-500 shadow-glow-emerald text-emerald-400'
                      : isCurrent
                      ? 'bg-slate-950 border-indigo-500 shadow-glow text-indigo-400 animate-pulse'
                      : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}
                >
                  {getStepIcon(step, idx, isCompleted, isCurrent)}
                </div>

                <div className="flex-1 ml-3">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-sm font-semibold transition ${
                        isStepCancelled
                          ? 'text-rose-300 font-bold'
                          : isStepReturn
                          ? 'text-purple-300 font-bold'
                          : isCompleted
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
                      isStepCancelled
                        ? 'text-rose-400/80'
                        : isStepReturn
                        ? 'text-purple-300/80'
                        : isCompleted
                        ? 'text-slate-400'
                        : 'text-slate-500'
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
        <div className="pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
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
