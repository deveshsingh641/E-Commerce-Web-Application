import React, { useState } from 'react';
import {
  ArrowLeft,
  Star,
  Check,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Minus,
  Plus,
  MessageSquare,
  User,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const ProductDetailPage = ({ product, onBack, onGoToCheckout }) => {
  const { addToCart, setIsCartOpen, showToast } = useCart();
  const { user } = useAuth();

  const [currentProduct, setCurrentProduct] = useState(product);
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [qty, setQty] = useState(1);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const images = currentProduct.images && currentProduct.images.length > 0
    ? currentProduct.images
    : [currentProduct.image];

  const isOutOfStock = currentProduct.countInStock <= 0;

  const handleAddToCart = () => {
    addToCart(currentProduct, qty);
  };

  const handleBuyNow = () => {
    addToCart(currentProduct, qty);
    if (onGoToCheckout) {
      onGoToCheckout();
    } else {
      setIsCartOpen(true);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setIsSubmittingReview(true);
    try {
      const res = await api.createReview(currentProduct._id, {
        rating: ratingInput,
        comment: commentInput.trim(),
      });
      setCurrentProduct(res.product);
      setCommentInput('');
      showToast('Thank you! Your review was published.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold hover:border-slate-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Catalog
      </button>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Images */}
        <div className="space-y-4">
          <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden glass-panel border border-slate-800 p-2 relative group">
            <img
              src={selectedImage}
              alt={currentProduct.name}
              className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
            />
            {currentProduct.badge && (
              <span className="absolute top-6 left-6 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 text-white shadow-glow">
                {currentProduct.badge}
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition ${
                    selectedImage === img
                      ? 'border-indigo-500 shadow-glow'
                      : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Purchase */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <span>{currentProduct.brand}</span>
              <span>&bull;</span>
              <span className="text-slate-400">{currentProduct.category}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {currentProduct.name}
            </h1>

            {/* Rating Stars */}
            <div className="flex items-center gap-3">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(currentProduct.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-white">{currentProduct.rating}</span>
              <span className="text-xs text-slate-400">
                ({currentProduct.numReviews || currentProduct.reviews?.length || 0} customer reviews)
              </span>
            </div>

            {/* Price Row */}
            <div className="flex items-baseline gap-4 py-2 border-y border-slate-800">
              <span className="text-3xl font-extrabold text-white">
                ${currentProduct.price.toFixed(2)}
              </span>
              {currentProduct.originalPrice > currentProduct.price && (
                <span className="text-base text-slate-500 line-through">
                  ${currentProduct.originalPrice.toFixed(2)}
                </span>
              )}
              {currentProduct.countInStock > 0 ? (
                <span className="ml-auto text-xs px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                  {currentProduct.countInStock} Units Available
                </span>
              ) : (
                <span className="ml-auto text-xs px-3 py-1 rounded-full bg-rose-950/80 text-rose-400 border border-rose-500/30">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-slate-300 leading-relaxed">
              {currentProduct.description}
            </p>

            {/* Features */}
            {currentProduct.features && currentProduct.features.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Key Technical Specifications:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentProduct.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Box */}
          <div className="space-y-4 pt-6 border-t border-slate-800">
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-slate-300">Quantity:</span>
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 disabled:opacity-30"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-5 text-sm font-bold text-white">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(currentProduct.countInStock, q + 1))}
                    disabled={qty >= currentProduct.countInStock}
                    className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 disabled:opacity-30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="flex-1 py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 border border-indigo-500/40 text-white text-sm font-bold flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-40"
              >
                <ShoppingBag className="w-4 h-4 text-indigo-400" />
                Add to Cart
              </button>
              <button
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold shadow-glow transition active:scale-95 disabled:opacity-40"
              >
                Buy Now
              </button>
            </div>

            {/* Service Highlights */}
            <div className="grid grid-cols-3 gap-2 pt-4 text-center text-[11px] text-slate-400">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <Truck className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                <span>Express Delivery</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span>2 Year Warranty</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <RotateCcw className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                <span>30-Day Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews & Ratings Section */}
      <section className="pt-10 border-t border-slate-800 space-y-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Verified Customer Reviews</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Write a Review Box */}
          <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-slate-800 h-fit space-y-4">
            <h3 className="text-sm font-bold text-white">Leave a Review</h3>
            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Your Rating:</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRatingInput(star)}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= ratingInput
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Your Feedback:</label>
                  <textarea
                    rows={3}
                    placeholder="Describe your experience with this product..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition disabled:opacity-40"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            ) : (
              <div className="text-xs text-slate-400 space-y-2">
                <p>Please log in with a customer or demo account to post a review.</p>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            {(!currentProduct.reviews || currentProduct.reviews.length === 0) ? (
              <div className="p-8 rounded-2xl glass-panel text-center text-slate-400 text-xs">
                No reviews yet. Be the first to share your thoughts on this product!
              </div>
            ) : (
              currentProduct.reviews.map((rev, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-300 font-bold text-xs">
                        {rev.name?.[0] || 'U'}
                      </div>
                      <span className="text-xs font-semibold text-white">{rev.name}</span>
                    </div>

                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= rev.rating ? 'fill-amber-400' : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                  {rev.createdAt && (
                    <span className="text-[10px] text-slate-500 block">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
