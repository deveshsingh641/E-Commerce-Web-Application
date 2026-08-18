import React, { useState } from 'react';
import { X, Star, Check, ShoppingBag, Truck, Shield, ArrowRight, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ProductQuickViewModal = ({ product, onClose, onGoToCheckout }) => {
  const { addToCart, setIsCartOpen } = useCart();
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product.image);

  if (!product) return null;

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const isOutOfStock = product.countInStock <= 0;

  const handleAddToCart = () => {
    addToCart(product, qty);
    onClose();
  };

  const handleBuyNow = () => {
    addToCart(product, qty);
    onClose();
    if (onGoToCheckout) {
      onGoToCheckout();
    } else {
      setIsCartOpen(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl rounded-3xl glass-modal border border-slate-700/60 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[85vh] overflow-y-auto">
          {/* Left: Product Images */}
          <div className="p-6 bg-slate-900/40 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800">
            <div className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800/80 mb-3 relative group">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {product.badge && (
                <span className="absolute top-3 left-3 px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 text-white shadow-md">
                  {product.badge}
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 w-full justify-center overflow-x-auto py-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition ${
                      selectedImage === img ? 'border-indigo-500 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details & Action */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  {product.brand || product.category}
                </span>
                <span className="text-slate-600">&bull;</span>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="text-xs font-bold text-slate-200">{product.rating}</span>
                  <span className="text-xs text-slate-400">({product.numReviews} reviews)</span>
                </div>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
                {product.name}
              </h2>

              <div className="flex items-baseline gap-3 my-3">
                <span className="text-2xl font-extrabold text-white">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-slate-500 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
                {product.countInStock > 0 ? (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                    {product.countInStock} In Stock
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-rose-950/80 text-rose-400 border border-rose-500/30">
                    Out of Stock
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                {product.description}
              </p>

              {/* Key Features */}
              {product.features && product.features.length > 0 && (
                <div className="mb-6 space-y-2">
                  <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                    Key Highlights:
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {product.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-xs text-slate-400 font-medium">Quantity:</span>
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      disabled={qty <= 1}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 disabled:opacity-30"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 text-sm font-semibold text-white">{qty}</span>
                    <button
                      onClick={() => setQty((q) => Math.min(product.countInStock, q + 1))}
                      disabled={qty >= product.countInStock}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 disabled:opacity-30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs text-slate-500">
                    Total: ${(product.price * qty).toFixed(2)}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-indigo-500/30 text-white text-sm font-semibold flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-40"
                >
                  <ShoppingBag className="w-4 h-4 text-indigo-400" />
                  Add to Cart
                </button>
                <button
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-glow transition active:scale-95 disabled:opacity-40"
                >
                  <span>Buy Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Service Guarantees */}
              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-indigo-400" /> Fast Express Delivery
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" /> 2-Year Warranty
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
