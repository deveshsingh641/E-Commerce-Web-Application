import React, { useState, useEffect } from 'react';
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
  Heart,
  Sparkles,
  Clock,
  ChevronRight,
  Share2,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { api } from '../services/api';

const FINISH_VARIANTS = [
  { name: 'Obsidian Black', hex: '#0f172a' },
  { name: 'Space Titanium', hex: '#334155' },
  { name: 'Silver Mist', hex: '#94a3b8' },
];

export const ProductDetailPage = ({ product, onBack, onGoToCheckout }) => {
  const { addToCart, setIsCartOpen, showToast } = useCart();
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [currentProduct, setCurrentProduct] = useState(product);
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [selectedFinish, setSelectedFinish] = useState(FINISH_VARIANTS[0]);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'policy' | 'warranty'
  const [qty, setQty] = useState(1);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);

  // Sync state when product prop changes
  useEffect(() => {
    setCurrentProduct(product);
    setSelectedImage(product.image);
    setQty(1);
  }, [product]);

  const images =
    currentProduct.images && currentProduct.images.length > 0
      ? currentProduct.images
      : [currentProduct.image];

  const isOutOfStock = currentProduct.countInStock <= 0;

  const handleAddToCart = () => {
    addToCart(currentProduct, qty);
    setIsAddedFeedback(true);
    setTimeout(() => setIsAddedFeedback(false), 1500);
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
      showToast('Thank you! Your verified review was published.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Calculate estimated delivery date: 3 days from now
  const estDeliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // Calculate review rating breakdown percentages
  const reviewsCount = currentProduct.reviews?.length || 0;
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (reviewsCount > 0) {
    currentProduct.reviews.forEach((r) => {
      const score = Math.round(r.rating);
      if (ratingCounts[score] !== undefined) ratingCounts[score]++;
    });
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-300 pb-16">
      {/* Breadcrumb Bar */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400">
        <button onClick={onBack} className="hover:text-white transition">
          Store
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-slate-400">{currentProduct.category}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-indigo-400 font-medium truncate max-w-xs">{currentProduct.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Gallery & Badges */}
        <div className="space-y-4">
          <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden glass-panel border border-slate-800 p-2 relative group shadow-2xl">
            <img
              src={selectedImage}
              alt={currentProduct.name}
              className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            {currentProduct.badge && (
              <span className="absolute top-6 left-6 px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-glow">
                {currentProduct.badge}
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img
                      ? 'border-indigo-500 shadow-glow scale-105'
                      : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-700'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Value Assurance Badges */}
          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs text-slate-300">
            <div className="p-3 rounded-2xl glass-panel border border-slate-800 flex flex-col items-center gap-1.5">
              <Truck className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-white">Express Delivery</span>
              <span className="text-[10px] text-slate-400">Tracked & Insured</span>
            </div>
            <div className="p-3 rounded-2xl glass-panel border border-slate-800 flex flex-col items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-white">2-Yr Warranty</span>
              <span className="text-[10px] text-slate-400">100% Genuine</span>
            </div>
            <div className="p-3 rounded-2xl glass-panel border border-slate-800 flex flex-col items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-purple-400" />
              <span className="font-semibold text-white">7-Day Guarantee</span>
              <span className="text-[10px] text-slate-400">Hassle-Free Return</span>
            </div>
          </div>
        </div>

        {/* Right: Product Spec & Ordering */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                <span>{currentProduct.brand}</span>
                <span>&bull;</span>
                <span className="text-slate-400">{currentProduct.category}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  showToast('Product link copied to clipboard!', 'info');
                }}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-900 border border-slate-800 transition"
                title="Share product link"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
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
                        : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-white">{currentProduct.rating}</span>
              <span className="text-xs text-slate-400">
                ({reviewsCount} verified reviews)
              </span>
            </div>

            {/* Pricing Row */}
            <div className="flex items-baseline gap-4 py-3 border-y border-slate-800/80">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                ${currentProduct.price.toFixed(2)}
              </span>
              {currentProduct.originalPrice > currentProduct.price && (
                <span className="text-base text-slate-500 line-through">
                  ${currentProduct.originalPrice.toFixed(2)}
                </span>
              )}
              {currentProduct.countInStock > 0 ? (
                <span className="ml-auto text-xs px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {currentProduct.countInStock} Units Available
                </span>
              ) : (
                <span className="ml-auto text-xs px-3 py-1 rounded-full bg-rose-950/80 text-rose-400 border border-rose-500/30">
                  Sold Out
                </span>
              )}
            </div>

            {/* Simulated Finish / Color Choice */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Selected Finish:</span>
                <span className="font-semibold text-white">{selectedFinish.name}</span>
              </div>
              <div className="flex gap-2.5">
                {FINISH_VARIANTS.map((finish) => (
                  <button
                    key={finish.name}
                    type="button"
                    onClick={() => setSelectedFinish(finish)}
                    className={`h-8 px-3 rounded-xl border flex items-center gap-2 text-xs transition ${
                      selectedFinish.name === finish.name
                        ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: finish.hex }}
                    />
                    <span>{finish.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-300 leading-relaxed pt-1">
              {currentProduct.description}
            </p>

            {/* Estimated Arrival Banner */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center gap-3 text-xs text-indigo-200">
              <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span>Order today to receive by </span>
                <strong className="text-white font-bold">{estDeliveryDate}</strong>
                <span> with Express Insured Courier.</span>
              </div>
            </div>
          </div>

          {/* Action Box */}
          <div className="space-y-4 pt-6 border-t border-slate-800">
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-slate-300">Quantity:</span>
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    aria-label="Decrease quantity"
                    className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 disabled:opacity-30"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-5 text-sm font-bold text-white" aria-live="polite">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(currentProduct.countInStock, q + 1))}
                    disabled={qty >= currentProduct.countInStock}
                    aria-label="Increase quantity"
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
                className={`flex-1 py-3.5 px-6 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-40 ${
                  isAddedFeedback
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-glow-emerald'
                    : 'bg-slate-900 hover:bg-slate-800 border-indigo-500/40 text-white'
                }`}
              >
                {isAddedFeedback ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-indigo-400" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
              <button
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold shadow-glow transition active:scale-95 disabled:opacity-40"
              >
                Buy Now
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(currentProduct)}
                aria-label={
                  isInWishlist(currentProduct._id) ? 'Remove from wishlist' : 'Add to wishlist'
                }
                className={`py-3.5 px-4 rounded-xl border flex items-center justify-center transition active:scale-95 ${
                  isInWishlist(currentProduct._id)
                    ? 'bg-rose-950/60 border-rose-500/50 text-rose-400'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title={isInWishlist(currentProduct._id) ? 'Saved in Wishlist' : 'Save to Wishlist'}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isInWishlist(currentProduct._id) ? 'fill-rose-500 text-rose-500' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Product Insights: Specs, Return Policy & Warranty */}
      <section className="glass-panel rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'specs'
                ? 'bg-indigo-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab('policy')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'policy'
                ? 'bg-indigo-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            7-Day Guarantee & Shipping
          </button>
          <button
            onClick={() => setActiveTab('warranty')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'warranty'
                ? 'bg-indigo-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Hardware Warranty
          </button>
        </div>

        {activeTab === 'specs' && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-bold text-white">Hardware & Design Specifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentProduct.features && currentProduct.features.length > 0 ? (
                currentProduct.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">Standard premium manufacturing specifications.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'policy' && (
          <div className="space-y-4 animate-in fade-in text-xs text-slate-300 leading-relaxed">
            <h3 className="text-sm font-bold text-white">7-Day Satisfaction & Return Guarantee</h3>
            <p>
              Every delivered order is automatically protected by our 7-day hassle-free return
              policy. If you are not completely delighted with your purchase, you may initiate a
              return directly from your <strong>My Orders</strong> portal.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Prepaid return shipping labels provided for verified domestic claims.</li>
              <li>Choice of refund to original payment method, store credit, or direct exchange.</li>
              <li>Inspected and processed within 48 hours of return hub arrival.</li>
            </ul>
          </div>
        )}

        {activeTab === 'warranty' && (
          <div className="space-y-4 animate-in fade-in text-xs text-slate-300 leading-relaxed">
            <h3 className="text-sm font-bold text-white">2-Year Official Manufacturer Warranty</h3>
            <p>
              All hardware and components are covered against manufacturing defects, electronic
              faults, and battery wear under normal consumer operation for 24 months from purchase.
            </p>
            <p className="text-slate-400">
              For support inquiries, our dedicated concierge team is available 24/7 through your
              account portal.
            </p>
          </div>
        )}
      </section>

      {/* Customer Reviews & Ratings Breakdown */}
      <section className="glass-panel rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Customer Reviews & Ratings</h2>
          </div>
          <span className="text-xs text-slate-400">
            {reviewsCount} verified purchase {reviewsCount === 1 ? 'review' : 'reviews'}
          </span>
        </div>

        {/* Rating Breakdown Bar Visualizer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-6 border-b border-slate-800">
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
            <span className="text-5xl font-black text-white">{currentProduct.rating.toFixed(1)}</span>
            <div className="flex items-center text-amber-400 my-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(currentProduct.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-400">Based on {reviewsCount} customer experiences</span>
          </div>

          <div className="md:col-span-2 space-y-2 flex flex-col justify-center">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingCounts[stars] || 0;
              const pct = reviewsCount > 0 ? Math.round((count / reviewsCount) * 100) : 0;
              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <span className="w-12 text-slate-400 font-semibold">{stars} Stars</span>
                  <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-slate-400">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Write & Read Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Write Box */}
          <div className="lg:col-span-1 p-6 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4 h-fit">
            <h3 className="text-sm font-bold text-white">Share Your Review</h3>
            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Overall Rating:</label>
                  <div className="flex gap-1.5">
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
                              : 'text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Your Feedback:</label>
                  <textarea
                    rows={4}
                    placeholder="Describe build quality, sound, battery, or aesthetics..."
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
                  {isSubmittingReview ? 'Publishing...' : 'Post Verified Review'}
                </button>
              </form>
            ) : (
              <div className="text-xs text-slate-400 space-y-2">
                <p>Sign in with your account to submit a verified product review.</p>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-3">
            {!currentProduct.reviews || currentProduct.reviews.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-950/40 border border-slate-800/80 text-center text-slate-400 text-xs">
                No reviews yet. Be the first to share your thoughts on this product!
              </div>
            ) : (
              currentProduct.reviews.map((rev, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                        {rev.name?.[0] || 'U'}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-white block">{rev.name}</span>
                        <span className="text-[10px] text-emerald-400 font-medium">
                          Verified Buyer
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= rev.rating ? 'fill-amber-400' : 'text-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pt-1">{rev.comment}</p>
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
