'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext(null);

const CART_STORAGE_KEY = 'nishkea_demo_cart_v1';
const WISHLIST_STORAGE_KEY = 'nishkea_demo_wishlist_v1';

export function StoreProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [notification, setNotification] = useState(null);

  // Safe localStorage hydration
  useEffect(() => {
    try {
      const savedCart = window.localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) setCart(parsed);
      }
    } catch {
      // Storage unavailable or blocked; proceed with in-memory state
    }

    try {
      const savedWishlist = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (savedWishlist) {
        const parsed = JSON.parse(savedWishlist);
        if (Array.isArray(parsed)) setWishlist(parsed);
      }
    } catch {
      // Storage unavailable or blocked
    }

    setIsHydrated(true);
  }, []);

  // Save Cart to localStorage safely
  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Storage quota or restriction; ignore silently
    }
  }, [cart, isHydrated]);

  // Save Wishlist to localStorage safely
  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      // Storage quota or restriction
    }
  }, [wishlist, isHydrated]);

  // Show transient toast
  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification((curr) => (curr === message ? null : curr));
    }, 3200);
  };

  // Cart operations
  const addToCart = (product, selectedVariant = null, quantity = 1) => {
    const variant = selectedVariant || (product.variants && product.variants[0]) || {
      sku: `${product.code}-DEF`,
      colour: 'Standard',
      size: 'Default',
      available: 10
    };

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.sku === variant.sku);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      }

      return [
        ...prevCart,
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          code: product.code,
          categoryName: product.categoryName,
          salesUnit: product.salesUnit,
          priceMinor: product.priceMinor,
          currency: product.currency || 'INR',
          image: (product.images && product.images[0]?.url) || '/images/categories/earrings.svg',
          sku: variant.sku,
          colour: variant.colour,
          size: variant.size,
          quantity: quantity
        }
      ];
    });

    showToast(`Added "${product.name}" to preview bag`);
  };

  const removeFromCart = (sku) => {
    setCart((prev) => prev.filter((item) => item.sku !== sku));
    showToast('Item removed from preview bag');
  };

  const updateCartQuantity = (sku, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(sku);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.sku === sku ? { ...item, quantity: Math.min(newQuantity, 10) } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist operations
  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        showToast(`Removed "${product.name}" from wishlist`);
        return prev.filter((item) => item.id !== product.id);
      }
      showToast(`Saved "${product.name}" to wishlist`);
      return [...prev, product];
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  // Computations (minor currency arithmetic)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotalMinor = cart.reduce((sum, item) => sum + (item.priceMinor * item.quantity), 0);

  return (
    <StoreContext.Provider
      value={{
        cart,
        cartCount,
        cartSubtotalMinor,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        wishlist,
        wishlistCount: wishlist.length,
        toggleWishlist,
        isInWishlist,
        notification,
        dismissNotification: () => setNotification(null)
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
