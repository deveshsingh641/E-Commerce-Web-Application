import React, { useState } from 'react';
import { Star, ShoppingBag, Eye, Check, AlertTriangle, Heart, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export const ProductCard = ({ product, onQuickView, onSelectProduct }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isAdded, setIsAdded] = useState(false);

  const isOutOfStock = product.countInStock <= 0;
  const isLowStock = product.countInStock > 0 && product.countInStock <= 5;
  const isSaved = isInWishlist(product._id);
  const discountPercent =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const handleAdd = () => {
    if (isOutOfStock) return;
    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1300);
  };

  return (
    <div className="group relative rounded-3xl glass-panel glass-panel-hover flex flex-col overflow-hidden transition-all duration-300 border border-slate-800/80 hover:border-indigo-500/30">
      {/* Badge & Promo (Top Left) */}
      <div className="absolute top-3.5 left-3.5 z-10 flex flex-col gap-1.5 pointer-events-none">
        {product.badge && (
          <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg backdrop-blur-md">
            {product.badge}
          </span>
        )}
        {discountPercent > 0 && (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-rose-500/90 text-white shadow-md w-fit">
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Wishlist & Stock Pill (Top Right) */}
      <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          aria-label={isSaved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          className={`p-2 rounded-xl backdrop-blur-md border transition-all active:scale-90 ${
            isSaved
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-sm'
              : 'bg-slate-900/80 text-slate-400 hover:text-rose-400 hover:bg-slate-800 border-slate-700/60'
          }`}
          title={isSaved ? 'Remove from Wishlist' : 'Save to Wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 transition-transform ${isSaved ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
        </button>

        {isOutOfStock ? (
          <span className="px-2.5 py-1 text-[10px] font-semibold rounded-xl bg-rose-950/80 text-rose-300 border border-rose-500/30 backdrop-blur-md">
            Sold Out
          </span>
        ) : isLowStock ? (
          <span className="px-2.5 py-1 text-[10px] font-semibold rounded-xl bg-amber-950/80 text-amber-300 border border-amber-500/30 backdrop-blur-md flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Only {product.countInStock} left
          </span>
        ) : (
          <span className="px-2.5 py-1 text-[10px] font-medium rounded-xl bg-slate-900/80 text-emerald-400 border border-emerald-500/20 backdrop-blur-md flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            In Stock
          </span>
        )}
      </div>

      {/* Product Image Area */}
      <div
        onClick={() => (onSelectProduct ? onSelectProduct(product) : onQuickView(product))}
        className="relative w-full pt-[85%] bg-slate-900/40 overflow-hidden cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-3.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-semibold backdrop-blur-md border border-slate-700/80 flex items-center justify-center gap-1.5 shadow-lg transition active:scale-95"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-indigo-400 font-semibold tracking-wider uppercase text-[10px]">
              {product.brand || product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" />
              <span className="text-xs font-semibold text-slate-200">{product.rating}</span>
              <span className="text-[10px] text-slate-500">({product.numReviews})</span>
            </div>
          </div>

          <h3
            onClick={() => (onSelectProduct ? onSelectProduct(product) : onQuickView(product))}
            className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 cursor-pointer"
            title={product.name}
          >
            {product.name}
          </h3>

          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Add to Cart Action */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
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
            type="button"
            disabled={isOutOfStock}
            onClick={handleAdd}
            aria-label={isOutOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md active:scale-95 ${
              isOutOfStock
                ? 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-700/50'
                : isAdded
                ? 'bg-emerald-600 text-white shadow-glow-emerald'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 hover:shadow-glow'
            }`}
            title={isOutOfStock ? 'Sold out' : isAdded ? 'Added!' : 'Add to bag'}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span className="text-[11px]">Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
