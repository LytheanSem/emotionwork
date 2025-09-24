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

  // Generate random pricing for equipment
  const generatePricing = (equipment: Equipment) => {
    // Generate random prices based on equipment type/category
    const basePrice = Math.floor(Math.random() * 200) + 50; // $50-$250 base
    const dailyPrice = basePrice;
    const weeklyPrice = Math.floor(basePrice * 5.5); // Weekly is ~5.5x daily
    
    return { dailyPrice, weeklyPrice };
  };

  const addToCart = (equipment: Equipment, quantity: number, rentalType: 'daily' | 'weekly', rentalDays: number) => {
    const { dailyPrice, weeklyPrice } = generatePricing(equipment);
    
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
      const price = item.rentalType === 'daily' ? item.dailyPrice : item.weeklyPrice;
      const days = item.rentalType === 'daily' ? item.rentalDays : Math.ceil(item.rentalDays / 7);
      return total + (price * item.quantity * days);
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
