import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  RefreshCw,
  ShoppingBag,
  PackageCheck,
  AlertCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  Star,
  Eye,
  Check,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { ProductQuickViewModal } from '../components/ProductQuickViewModal';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const CATEGORIES = [
  'All',
  'Audio',
  'Wearables',
  'Electronics',
  'Gaming',
  'Fashion',
  'Home & Living',
];

export const CatalogPage = ({
  searchQuery,
  setSearchQuery,
  onSelectProduct,
  onGoToCheckout,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [maxPrice, setMaxPrice] = useState(1000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Debounced search query to prevent rapid continuous API requests
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const params = {
        keyword: debouncedSearch || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        maxPrice: maxPrice < 1000 ? maxPrice : undefined,
        sort: sortBy !== 'newest' ? sortBy : undefined,
        inStock: inStockOnly ? 'true' : undefined,
      };
      const data = await api.getProducts(params);
      const list = Array.isArray(data) ? data : data?.products || [];
      setProducts(list);
    } catch (err) {
      console.error('Failed to load products', err);
      setFetchError(err.message || 'Failed to load products from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [debouncedSearch, selectedCategory, sortBy, maxPrice, inStockOnly]);

  const hasActiveFilters =
    selectedCategory !== 'All' || debouncedSearch || maxPrice < 1000 || inStockOnly;

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Hero Banner */}
      <section className="relative rounded-3xl overflow-hidden glass-panel border border-indigo-500/20 p-8 sm:p-12 shadow-2xl">
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -top-20 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Audio & Smart Living Collection</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Engineered for <span className="shimmer-text">Perfection</span>. Built for Everyday.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Discover precision-crafted gear, hi-fi planar audio, and designer essentials. Use code{' '}
            <span className="font-mono font-bold text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-500/30">
              SAVE20
            </span>{' '}
            at checkout for $20 off orders over $100.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                setSelectedCategory('Audio');
                window.scrollTo({ top: 460, behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-glow transition active:scale-95"
            >
              Explore Audio Gear
            </button>
            <button
              onClick={() => {
                setSelectedCategory('Wearables');
                window.scrollTo({ top: 460, behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm font-semibold transition active:scale-95"
            >
              Smart Wearables
            </button>
          </div>
        </div>
      </section>

      {/* 4-Pillar Trust Strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Free Express Shipping</h4>
            <p className="text-[11px] text-slate-400">On all orders over $150</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">7-Day Guarantee</h4>
            <p className="text-[11px] text-slate-400">Prepaid hassle-free returns</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">2-Year Warranty</h4>
            <p className="text-[11px] text-slate-400">Official manufacturer protection</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">24/7 Concierge Support</h4>
            <p className="text-[11px] text-slate-400">Expert assistance anytime</p>
          </div>
        </div>
      </section>

      {/* Category Pills & Filters */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-slate-800/80">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full scrollbar-none" role="tablist">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-glow'
                    : 'bg-slate-900/70 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort & Filter Controls */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View"
                aria-label="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'list' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="List View"
                aria-label="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* In-Stock Filter Toggle */}
            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition ${
                inStockOnly
                  ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>In Stock</span>
            </button>

            {/* Price slider */}
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <label htmlFor="price-range" className="whitespace-nowrap">
                Max: ${maxPrice}
              </label>
              <input
                id="price-range"
                type="range"
                min="50"
                max="1000"
                step="25"
                value={maxPrice}
                aria-label="Maximum price filter"
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-20 accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Sort Select */}
            <div className="relative">
              <select
                value={sortBy}
                aria-label="Sort products by"
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="newest">Featured & Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Reviewed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Metadata & Active Filter Badges */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              Showing <strong className="text-white">{products.length}</strong> items
            </span>

            {/* Active Filter Chips */}
            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-[11px]">
                {selectedCategory}
                <button onClick={() => setSelectedCategory('All')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {debouncedSearch && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-[11px]">
                "{debouncedSearch}"
                <button onClick={() => setSearchQuery('')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[11px]">
                In Stock Only
                <button onClick={() => setInStockOnly(false)} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {maxPrice < 1000 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
                Under ${maxPrice}
                <button onClick={() => setMaxPrice(1000)} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setMaxPrice(1000);
                setSortBy('newest');
                setInStockOnly(false);
              }}
              className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset All Filters
            </button>
          )}
        </div>
      </section>

      {/* Products Display (Grid vs List) */}
      <section>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="h-80 rounded-3xl glass-panel animate-pulse bg-slate-900/40 p-4 flex flex-col justify-between"
              >
                <div className="w-full h-44 bg-slate-800/60 rounded-2xl" />
                <div className="space-y-2 mt-4">
                  <div className="h-4 bg-slate-800/60 rounded w-3/4" />
                  <div className="h-3 bg-slate-800/40 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : fetchError ? (
          <div className="rounded-3xl glass-panel p-10 text-center max-w-md mx-auto space-y-4 my-8 border border-rose-500/30">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Failed to Load Catalog</h3>
            <p className="text-xs text-slate-400">{fetchError}</p>
            <button
              onClick={fetchProducts}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-glow"
            >
              Retry Connection
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl glass-panel p-12 text-center max-w-md mx-auto space-y-4 my-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/60 mx-auto flex items-center justify-center text-slate-500">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No products found</h3>
            <p className="text-xs text-slate-400">
              We couldn't find any products matching your filters. Try clearing your search or
              adjusting category and price filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setMaxPrice(1000);
                setInStockOnly(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-glow"
            >
              Clear All Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onQuickView={setQuickViewProduct}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        ) : (
          /* List View Mode */
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product._id}
                className="p-5 rounded-3xl glass-panel border border-slate-800 flex flex-col md:flex-row gap-6 items-center hover:border-slate-700 transition"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  onClick={() => onSelectProduct(product)}
                  className="w-full md:w-48 h-48 rounded-2xl object-cover bg-slate-900 border border-slate-800 cursor-pointer shrink-0 group-hover:scale-105 transition-transform"
                />

                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-indigo-400 font-bold uppercase tracking-wider text-[10px]">
                      {product.brand || product.category}
                    </span>
                    <span className="text-slate-600">&bull;</span>
                    <div className="flex items-center text-amber-400 gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="text-slate-200 font-semibold">{product.rating}</span>
                      <span className="text-slate-500 text-[10px]">({product.numReviews} reviews)</span>
                    </div>
                  </div>

                  <h3
                    onClick={() => onSelectProduct(product)}
                    className="text-base font-bold text-white hover:text-indigo-300 cursor-pointer transition truncate"
                  >
                    {product.name}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  {product.features && product.features.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {product.features.slice(0, 3).map((feat, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 text-[11px] border border-slate-800"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-48 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800 shrink-0 gap-3">
                  <div>
                    <span className="text-2xl font-black text-white">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-xs text-slate-500 line-through block text-right">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setQuickViewProduct(product)}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition"
                      title="Quick View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      disabled={product.countInStock <= 0}
                      onClick={() => addToCart(product, 1)}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-glow flex items-center gap-1.5 transition disabled:opacity-40"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onGoToCheckout={onGoToCheckout}
        />
      )}
    </div>
  );
};
