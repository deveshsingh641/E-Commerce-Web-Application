import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export const WishlistDrawer = ({ onSelectProduct }) => {
  const { wishlistItems, isWishlistOpen, setIsWishlistOpen, removeFromWishlist, clearWishlist } =
    useWishlist();
  const { addToCart } = useCart();

  if (!isWishlistOpen) return null;

  const handleMoveToCart = (item) => {
    addToCart(item, 1);
    removeFromWishlist(item._id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={() => setIsWishlistOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900/95 border-l border-slate-800 shadow-2xl backdrop-blur-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Heart className="w-5 h-5 fill-rose-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Saved Wishlist</h2>
                <p className="text-xs text-slate-400">
                  {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {wishlistItems.length > 0 && (
                <button
                  onClick={clearWishlist}
                  className="text-xs text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
                  title="Clear All"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setIsWishlistOpen(false)}
                aria-label="Close wishlist drawer"
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Wishlist Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {wishlistItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mb-4 text-slate-500">
                  <Heart className="w-8 h-8 text-rose-500/40" />
                </div>
                <h3 className="text-base font-semibold text-slate-200 mb-1">Your wishlist is empty</h3>
                <p className="text-xs text-slate-400 max-w-xs mb-6">
                  Save your favorite items by tapping the heart icon on any product card.
                </p>
                <button
                  onClick={() => setIsWishlistOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              wishlistItems.map((item) => (
                <div
                  key={item._id}
                  className="p-3.5 rounded-2xl glass-panel border border-slate-800 flex gap-3 items-center group"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-800/80 cursor-pointer"
                    onClick={() => {
                      if (onSelectProduct) {
                        onSelectProduct(item);
                        setIsWishlistOpen(false);
                      }
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-indigo-400 font-semibold uppercase">
                      {item.brand || item.category}
                    </p>
                    <h4
                      className="text-xs font-semibold text-white truncate cursor-pointer hover:text-indigo-300"
                      onClick={() => {
                        if (onSelectProduct) {
                          onSelectProduct(item);
                          setIsWishlistOpen(false);
                        }
                      }}
                    >
                      {item.name}
                    </h4>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xs font-bold text-white">${item.price?.toFixed(2)}</span>
                      {item.originalPrice > item.price && (
                        <span className="text-[10px] text-slate-500 line-through">
                          ${item.originalPrice?.toFixed(2)}
                        </span>
                      )}
                      {item.countInStock <= 0 && (
                        <span className="text-[10px] text-rose-400 font-semibold">Out of Stock</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      disabled={item.countInStock <= 0}
                      onClick={() => handleMoveToCart(item)}
                      title="Move to Cart"
                      aria-label={`Move ${item.name} to cart`}
                      className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-40"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item._id)}
                      title="Remove from Wishlist"
                      aria-label={`Remove ${item.name} from wishlist`}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700/60 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {wishlistItems.length > 0 && (
            <div className="p-6 border-t border-slate-800/80 bg-slate-950/60">
              <button
                onClick={() => {
                  wishlistItems.forEach((item) => {
                    if (item.countInStock > 0) addToCart(item, 1);
                  });
                  clearWishlist();
                  setIsWishlistOpen(false);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-glow flex items-center justify-center gap-2 transition"
              >
                <span>Move All In-Stock to Bag</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
