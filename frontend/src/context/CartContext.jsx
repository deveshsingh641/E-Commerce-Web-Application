import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem('aura_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem('aura_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  const addToCart = (product, qty = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product === product._id);
      if (existingItem) {
        const newQty = Math.min(existingItem.qty + qty, product.countInStock || 99);
        showToast(`Updated "${product.name}" quantity to ${newQty}`, 'info');
        return prevItems.map((item) =>
          item.product === product._id ? { ...item, qty: newQty } : item
        );
      } else {
        showToast(`Added "${product.name}" to your bag`, 'success');
        return [
          ...prevItems,
          {
            product: product._id,
            name: product.name,
            image: product.image,
            price: product.price,
            countInStock: product.countInStock,
            category: product.category,
            qty: Math.min(qty, product.countInStock || 1),
          },
        ];
      }
    });
  };

  const updateQuantity = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product === productId
          ? { ...item, qty: Math.min(qty, item.countInStock || 99) }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => {
      const removed = prevItems.find((i) => i.product === productId);
      if (removed) {
        showToast(`Removed "${removed.name}" from cart`, 'info');
      }
      return prevItems.filter((item) => item.product !== productId);
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const applyCoupon = (code) => {
    const cleanCode = (code || couponCode).trim().toUpperCase();
    setCouponError('');
    if (cleanCode === 'SAVE20') {
      setAppliedCoupon({ code: 'SAVE20', discount: 20, type: 'fixed', label: '$20 Off' });
      showToast('Coupon "SAVE20" applied: $20 off!', 'success');
      return true;
    } else if (cleanCode === 'WELCOME10') {
      setAppliedCoupon({ code: 'WELCOME10', discount: 0.1, type: 'percent', label: '10% Off' });
      showToast('Coupon "WELCOME10" applied: 10% off!', 'success');
      return true;
    } else if (cleanCode === 'FREESHIP') {
      setAppliedCoupon({ code: 'FREESHIP', discount: 15, type: 'shipping', label: 'Free Shipping' });
      showToast('Coupon "FREESHIP" applied: Free Delivery!', 'success');
      return true;
    } else {
      setCouponError('Invalid promo code. Try SAVE20, WELCOME10, or FREESHIP');
      showToast('Invalid promo code', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    showToast('Coupon removed', 'info');
  };

  // Calculations
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const itemsPrice = Number(
    cartItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2)
  );

  let shippingPrice = itemsPrice > 150 || itemsPrice === 0 ? 0 : 15;
  if (appliedCoupon?.type === 'shipping') {
    shippingPrice = 0;
  }

  const taxPrice = Number((itemsPrice * 0.08).toFixed(2));

  let discountPrice = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'fixed') {
      discountPrice = Math.min(appliedCoupon.discount, itemsPrice);
    } else if (appliedCoupon.type === 'percent') {
      discountPrice = Number((itemsPrice * appliedCoupon.discount).toFixed(2));
    }
  }

  const totalPrice = Number(
    Math.max(0, itemsPrice + shippingPrice + taxPrice - discountPrice).toFixed(2)
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItemsCount,
        itemsPrice,
        shippingPrice,
        taxPrice,
        discountPrice,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
        couponCode,
        setCouponCode,
        appliedCoupon,
        couponError,
        toast,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
