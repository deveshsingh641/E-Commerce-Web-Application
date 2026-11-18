import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCart } from './CartContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { showToast } = useCart();
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const stored = localStorage.getItem('aura_wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('aura_wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => (item._id || item.product) === productId);
  };

  const toggleWishlist = (product) => {
    if (!product || !product._id) return;

    if (isInWishlist(product._id)) {
      setWishlistItems((prev) => prev.filter((item) => (item._id || item.product) !== product._id));
      showToast(`Removed "${product.name}" from your wishlist`, 'info');
    } else {
      setWishlistItems((prev) => [
        ...prev,
        {
          _id: product._id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          brand: product.brand,
          category: product.category,
          countInStock: product.countInStock,
          rating: product.rating,
        },
      ]);
      showToast(`Saved "${product.name}" to your wishlist`, 'success');
    }
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems((prev) => prev.filter((item) => (item._id || item.product) !== productId));
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    showToast('Wishlist cleared', 'info');
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        totalWishlistCount: wishlistItems.length,
        isWishlistOpen,
        setIsWishlistOpen,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
