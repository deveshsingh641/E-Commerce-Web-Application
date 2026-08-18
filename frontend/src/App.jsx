import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { Toast } from './components/Toast';

import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthPage } from './pages/AuthPage';

function AppContent() {
  const [currentTab, setCurrentTab] = useState('catalog'); // 'catalog' | 'detail' | 'checkout' | 'orders' | 'admin' | 'auth'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setCurrentTab('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToCheckout = () => {
    setCurrentTab('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderPlaced = (orderId) => {
    setSelectedOrderId(orderId);
    setCurrentTab('orders');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'catalog' && (
          <CatalogPage
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectProduct={handleSelectProduct}
            onGoToCheckout={handleGoToCheckout}
          />
        )}

        {currentTab === 'detail' && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            onBack={() => setCurrentTab('catalog')}
            onGoToCheckout={handleGoToCheckout}
          />
        )}

        {currentTab === 'checkout' && (
          <CheckoutPage
            onOrderPlaced={handleOrderPlaced}
            onGoBackToStore={() => setCurrentTab('catalog')}
          />
        )}

        {currentTab === 'orders' && (
          <OrdersPage
            selectedOrderId={selectedOrderId}
            onGoToStore={() => setCurrentTab('catalog')}
          />
        )}

        {currentTab === 'admin' && <AdminDashboard />}

        {currentTab === 'auth' && (
          <AuthPage
            onAuthSuccess={() => {
              setCurrentTab('catalog');
            }}
          />
        )}
      </main>

      {/* Slide-over Cart Drawer */}
      <CartDrawer onProceedCheckout={handleGoToCheckout} />

      {/* Global Toast Feedback */}
      <Toast />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
