import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  SlidersHorizontal,
  ArrowUpDown,
  Search,
  Filter,
  CheckCircle2,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { ProductQuickViewModal } from '../components/ProductQuickViewModal';
import { api } from '../services/api';

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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [maxPrice, setMaxPrice] = useState(1000);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        keyword: searchQuery || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        maxPrice: maxPrice < 1000 ? maxPrice : undefined,
        sort: sortBy !== 'newest' ? sortBy : undefined,
      };
      const data = await api.getProducts(params);
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory, sortBy, maxPrice]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Banner */}
      <section className="relative rounded-3xl overflow-hidden glass-panel border border-indigo-500/20 p-8 sm:p-12">
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
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-glow transition active:scale-95"
            >
              Explore Audio Gear
            </button>
            <button
              onClick={() => {
                setSelectedCategory('Wearables');
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm font-semibold transition active:scale-95"
            >
              Smart Wearables
            </button>
          </div>
        </div>
      </section>

      {/* Category Pills & Filters */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-slate-800/80">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
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

          {/* Sort & Price Filter Controls */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Price slider dropdown / pill */}
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <span>Max: ${maxPrice}</span>
              <input
                type="range"
                min="50"
                max="1000"
                step="25"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-20 accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Sort Select */}
            <div className="relative">
              <select
                value={sortBy}
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

        {/* Results Metadata */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            Showing <strong className="text-white">{products.length}</strong> items
            {selectedCategory !== 'All' && ` in "${selectedCategory}"`}
            {searchQuery && ` matching "${searchQuery}"`}
          </span>
          {(selectedCategory !== 'All' || searchQuery || maxPrice < 1000 || sortBy !== 'newest') && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setMaxPrice(1000);
                setSortBy('newest');
              }}
              className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <section>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="h-80 rounded-2xl glass-panel animate-pulse bg-slate-900/40 p-4 flex flex-col justify-between"
              >
                <div className="w-full h-44 bg-slate-800/60 rounded-xl" />
                <div className="space-y-2 mt-4">
                  <div className="h-4 bg-slate-800/60 rounded w-3/4" />
                  <div className="h-3 bg-slate-800/40 rounded w-1/2" />
                </div>
              </div>
            ))}
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
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-glow"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
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
