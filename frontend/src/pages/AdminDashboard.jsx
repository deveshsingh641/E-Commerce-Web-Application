import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  DollarSign,
  Package,
  Users,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  X,
  RotateCcw,
  Sparkles,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const AdminDashboard = () => {
  const { user, isAdmin, loginDemoAdmin } = useAuth();
  const { showToast } = useCart();

  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders' | 'analytics'
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Product Modal State (Add / Edit)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    brand: 'Aura',
    category: 'Electronics',
    price: '',
    originalPrice: '',
    countInStock: '',
    description: '',
    image: '',
    badge: '',
    features: '',
    isFeatured: false,
  });

  const loadData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const [statsData, productsData, ordersData] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getProducts(),
        api.getAllOrders(orderFilter !== 'All' ? orderFilter : undefined),
      ]);
      setStats(statsData);
      setProducts(productsData);
      setOrders(ordersData);
    } catch (err) {
      console.error('Failed to load admin data', err);
      showToast(err.message || 'Error loading dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, orderFilter]);

  // Open Create Product Modal
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      brand: 'Aura',
      category: 'Electronics',
      price: '',
      originalPrice: '',
      countInStock: '15',
      description: '',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      badge: 'New Arrival',
      features: 'High Quality Build, Wireless Connectivity, Fast Charging',
      isFeatured: true,
    });
    setIsProductModalOpen(true);
  };

  // Open Edit Product Modal
  const handleOpenEditModal = (p) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      brand: p.brand || 'Aura',
      category: p.category || 'Electronics',
      price: p.price,
      originalPrice: p.originalPrice || p.price,
      countInStock: p.countInStock,
      description: p.description,
      image: p.image,
      badge: p.badge || '',
      features: Array.isArray(p.features) ? p.features.join(', ') : (p.features || ''),
      isFeatured: p.isFeatured || false,
    });
    setIsProductModalOpen(true);
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct._id, productForm);
        showToast(`Product "${productForm.name}" updated successfully`, 'success');
      } else {
        await api.createProduct(productForm);
        showToast(`Product "${productForm.name}" added to catalog`, 'success');
      }
      setIsProductModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to save product', 'error');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.deleteProduct(id);
      showToast(`Product deleted successfully`, 'info');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to delete product', 'error');
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      showToast(`Order status changed to ${newStatus}`, 'success');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to update order status', 'error');
    }
  };

  // Reset Database
  const handleResetDatabase = async () => {
    if (!window.confirm('Reset database to default seed catalog and orders?')) return;
    setLoading(true);
    try {
      await api.resetDatabase();
      showToast('Database reset and seeded with default products!', 'success');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to reset database', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="rounded-3xl glass-panel p-12 text-center max-w-md mx-auto space-y-4 my-12 animate-in fade-in">
        <ShieldCheck className="w-16 h-16 text-emerald-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Admin Privileges Required</h2>
        <p className="text-xs text-slate-400">
          This portal allows managing catalog inventory, pricing, and live customer orders.
        </p>
        <button
          onClick={loginDemoAdmin}
          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glow-emerald transition"
        >
          Sign In as Demo Admin
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Admin Command Center
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time analytics, inventory management, and order fulfillment pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDatabase}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
            title="Reset database to seed records"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            Reset Seed Data
          </button>
          <button
            onClick={loadData}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Analytics KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Revenue
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">
            ${stats ? stats.totalRevenue.toFixed(2) : '0.00'}
          </p>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Live Gross Sales
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Orders
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">
            {stats ? stats.totalOrders : orders.length}
          </p>
          <p className="text-[11px] text-indigo-300">All Time Placed Orders</p>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Catalog Items
            </span>
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">
            {products.length}
          </p>
          <p className="text-[11px] text-purple-300">Active SKUs in Store</p>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Registered Users
            </span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">
            {stats ? stats.totalUsers : 1}
          </p>
          <p className="text-[11px] text-amber-300">Active Customer Accounts</p>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'products'
              ? 'bg-emerald-600 text-white shadow-glow-emerald'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Product Catalog Management ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-emerald-600 text-white shadow-glow-emerald'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          Orders Fulfillment Pipeline ({orders.length})
        </button>
      </div>

      {/* Tab 1: Products Management */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-white">Store Catalog & Inventory</h3>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-glow flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              Add New Product
            </button>
          </div>

          <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Product</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Price</th>
                    <th className="p-3.5">Stock</th>
                    <th className="p-3.5">Rating</th>
                    <th className="p-3.5">Badge</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {products.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-900 border border-slate-800 shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-white truncate max-w-xs">{p.name}</p>
                          <p className="text-[11px] text-slate-500">{p.brand}</p>
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-300">{p.category}</td>
                      <td className="p-3.5 font-bold text-white">${p.price.toFixed(2)}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.countInStock <= 0
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                              : p.countInStock <= 5
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {p.countInStock} Units
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-300 font-semibold">{p.rating} / 5</td>
                      <td className="p-3.5">
                        {p.badge ? (
                          <span className="px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 text-[10px]">
                            {p.badge}
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p._id, p.name)}
                          className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900 text-rose-400 hover:text-rose-200 transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Orders Fulfillment Management */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <h3 className="text-base font-bold text-white">Customer Orders Fulfillment</h3>
            
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Filter Status:</span>
              <select
                value={orderFilter}
                onChange={(e) => setOrderFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs font-medium text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Orders</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Return Requested">Return Requested</option>
                <option value="Returned">Returned</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Order ID</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Items</th>
                    <th className="p-3.5">Total Price</th>
                    <th className="p-3.5">Payment</th>
                    <th className="p-3.5">Fulfillment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-400">
                        No orders found in this filter category.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o._id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5 font-mono font-bold text-white">
                          #{o._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="p-3.5">
                          <p className="font-semibold text-white">{o.shippingAddress?.fullName || o.user?.name}</p>
                          <p className="text-[11px] text-slate-500">{o.shippingAddress?.city}, {o.shippingAddress?.state}</p>
                          {o.cancelReason && (
                            <p className="text-[10px] text-rose-400 mt-0.5">Cancel: {o.cancelReason}</p>
                          )}
                          {o.returnReason && (
                            <p className="text-[10px] text-purple-400 mt-0.5">Return: {o.returnReason}</p>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-400">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-white">
                            {o.orderItems?.reduce((acc, i) => acc + i.qty, 0)} items
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-indigo-400">
                          ${o.totalPrice?.toFixed(2)}
                        </td>
                        <td className="p-3.5 text-slate-400 text-[11px]">
                          {o.paymentMethod}
                        </td>
                        <td className="p-3.5">
                          {/* Live Status Selector */}
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                            className={`text-xs font-bold px-2.5 py-1 rounded-xl border focus:outline-none cursor-pointer ${
                              o.status === 'Cancelled'
                                ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                                : o.status === 'Return Requested'
                                ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                                : o.status === 'Returned'
                                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                                : o.status === 'Delivered'
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                                : o.status === 'Shipped' || o.status === 'Out for Delivery'
                                ? 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40'
                                : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            <option value="Confirmed" className="bg-slate-900 text-white">Confirmed</option>
                            <option value="Processing" className="bg-slate-900 text-white">Processing</option>
                            <option value="Shipped" className="bg-slate-900 text-white">Shipped</option>
                            <option value="Out for Delivery" className="bg-slate-900 text-white">Out for Delivery</option>
                            <option value="Delivered" className="bg-slate-900 text-white">Delivered</option>
                            <option value="Return Requested" className="bg-slate-900 text-white">Return Requested</option>
                            <option value="Returned" className="bg-slate-900 text-white">Returned</option>
                            <option value="Cancelled" className="bg-slate-900 text-white">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl glass-modal border border-slate-700 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white">
                {editingProduct ? 'Edit Catalog Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Brand</label>
                  <input
                    type="text"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Category *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Audio">Audio</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home & Living">Home & Living</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Stock Count *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.countInStock}
                    onChange={(e) => setProductForm({ ...productForm, countInStock: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Original Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-slate-400 font-medium">Image URL *</label>
                  <input
                    type="url"
                    required
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Badge (e.g. Best Seller, Hot)</label>
                  <input
                    type="text"
                    value={productForm.badge}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Features (comma separated)</label>
                  <input
                    type="text"
                    value={productForm.features}
                    onChange={(e) => setProductForm({ ...productForm, features: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-slate-400 font-medium">Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-glow"
                >
                  {editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
