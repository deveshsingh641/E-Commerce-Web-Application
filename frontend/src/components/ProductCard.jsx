import React from 'react';
import { Star, ShoppingBag, Eye, Check, AlertTriangle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ProductCard = ({ product, onQuickView, onSelectProduct }) => {
  const { addToCart } = useCart();
  const isOutOfStock = product.countInStock <= 0;
  const isLowStock = product.countInStock > 0 && product.countInStock <= 5;
  const discountPercent = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group relative rounded-2xl glass-panel glass-panel-hover flex flex-col overflow-hidden transition-all duration-300">
      {/* Badge (Top Left) */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {product.badge && (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md">
            {product.badge}
          </span>
        )}
        {discountPercent > 0 && (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-500/90 text-white shadow-sm">
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Stock Status Pill (Top Right) */}
      <div className="absolute top-3 right-3 z-10">
        {isOutOfStock ? (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-rose-950/80 text-rose-300 border border-rose-500/30">
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-amber-950/80 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5" /> Only {product.countInStock} left
          </span>
        ) : (
          <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-900/80 text-emerald-400 border border-emerald-500/20 backdrop-blur-md">
            In Stock
          </span>
        )}
      </div>

      {/* Product Image Area */}
      <div
        onClick={() => onSelectProduct ? onSelectProduct(product) : onQuickView(product)}
        className="relative w-full pt-[85%] bg-slate-900/50 overflow-hidden cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="w-full py-2 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-semibold backdrop-blur-md border border-slate-700 flex items-center justify-center gap-1.5 shadow-lg transition-transform active:scale-95"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            Quick View
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="text-indigo-400 font-medium uppercase tracking-wider text-[10px]">
              {product.brand || product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" />
              <span className="text-xs font-semibold text-slate-200">{product.rating}</span>
              <span className="text-[10px] text-slate-500">({product.numReviews})</span>
            </div>
          </div>

          <h3
            onClick={() => onSelectProduct ? onSelectProduct(product) : onQuickView(product)}
            className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 cursor-pointer"
            title={product.name}
          >
            {product.name}
          </h3>

          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-white tracking-tight">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-slate-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <button
            disabled={isOutOfStock}
            onClick={() => addToCart(product, 1)}
            className={`p-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center shadow-md active:scale-95 ${
              isOutOfStock
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 hover:shadow-glow'
            }`}
            title={isOutOfStock ? 'Sold out' : 'Add to cart'}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
