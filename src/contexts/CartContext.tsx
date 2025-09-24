"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Equipment } from '@/lib/db';

export interface CartItem {
  id: string; // Unique identifier for this cart item
  equipment: Equipment;
  quantity: number;
  rentalType: 'daily' | 'weekly';
  rentalDays: number;
  dailyPrice: number;
  weeklyPrice: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (equipment: Equipment, quantity: number, rentalType: 'daily' | 'weekly', rentalDays: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateRentalType: (cartItemId: string, rentalType: 'daily' | 'weekly', rentalDays: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('equipment-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('equipment-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Calculate deterministic pricing for equipment
  const calculatePricing = (equipment: Equipment) => {
    // Deterministic pricing based on equipment properties
    let basePrice = 50; // Minimum price
    
    // Adjust based on equipment name (deterministic)
    const nameHash = hashString(equipment.name);
    basePrice += (nameHash % 150) + 50; // $50-$200 range
    
    // Adjust based on category if available
    if (equipment.categoryId) {
      const categoryHash = hashString(equipment.categoryId);
      basePrice += (categoryHash % 50); // Additional $0-$50
    }
    
    // Adjust based on brand if available
    if (equipment.brand) {
      const brandHash = hashString(equipment.brand);
      basePrice += (brandHash % 30); // Additional $0-$30
    }
    
    // Ensure price is within reasonable bounds
    const dailyPrice = Math.max(50, Math.min(300, basePrice));
    const weeklyPrice = Math.floor(dailyPrice * 5.5); // Weekly is ~5.5x daily
    
    return { dailyPrice, weeklyPrice };
  };

  // Simple hash function for deterministic pricing
  const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };

  const addToCart = (equipment: Equipment, quantity: number, rentalType: 'daily' | 'weekly', rentalDays: number) => {
    const { dailyPrice, weeklyPrice } = calculatePricing(equipment);
    
    // Create a unique ID for this cart item
    const cartItemId = `${equipment._id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    setCartItems(prev => {
      // Always add as a new item instead of merging
      return [...prev, {
        id: cartItemId,
        equipment,
        quantity,
        rentalType,
        rentalDays,
        dailyPrice,
        weeklyPrice
      }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.id === cartItemId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const updateRentalType = (cartItemId: string, rentalType: 'daily' | 'weekly', rentalDays: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === cartItemId
          ? { ...item, rentalType, rentalDays }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      if (item.rentalType === 'daily') {
        // Daily pricing: price per day
        return total + (item.dailyPrice * item.quantity * item.rentalDays);
      } else {
        // Weekly pricing: use hybrid model for partial weeks
        const fullWeeks = Math.floor(item.rentalDays / 7);
        const remainingDays = item.rentalDays % 7;
        
        // Calculate price for full weeks
        const weeklyPrice = item.weeklyPrice * item.quantity * fullWeeks;
        
        // Calculate price for remaining days (use daily rate for partial week)
        const dailyPrice = item.dailyPrice * item.quantity * remainingDays;
        
        return total + weeklyPrice + dailyPrice;
      }
    }, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateRentalType,
        clearCart,
        getTotalPrice,
        getCartItemCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
