"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart, CartItem } from "@/contexts/CartContext";
import { X, ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout?: () => void;
  redirectUrl?: string; // Custom redirect URL
  buttonText?: string; // Custom button text
}

export function CartModal({ isOpen, onClose, onCheckout, redirectUrl = "/book-stage", buttonText = "Proceed to Book Stage" }: CartModalProps) {
  const router = useRouter();
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    updateRentalType, 
    clearCart, 
    getTotalPrice, 
    getCartItemCount 
  } = useCart();
  

  if (!isOpen) return null;

  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    updateQuantity(item.id, newQuantity);
  };

  const handleRentalTypeChange = (item: CartItem, rentalType: 'daily' | 'weekly') => {
    const rentalDays = rentalType === 'daily' ? 1 : 7;
    updateRentalType(item.id, rentalType, rentalDays);
  };

  const handleRentalDaysChange = (item: CartItem, days: number) => {
    updateRentalType(item.id, item.rentalType, days);
  };

  const getItemPrice = (item: CartItem) => {
    const price = item.rentalType === 'daily' ? item.dailyPrice : item.weeklyPrice;
    const days = item.rentalType === 'daily' ? item.rentalDays : Math.ceil(item.rentalDays / 7);
    return price * item.quantity * days;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Shopping Cart ({getCartItemCount()} items)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500">Add some equipment to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex gap-4">
                    {/* Equipment Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.equipment.imageUrl ? (
                        <Image
                          src={item.equipment.imageUrl}
                          alt={item.equipment.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400 text-2xl">×</span>
                        </div>
                      )}
                    </div>

                    {/* Equipment Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.equipment.name}</h3>
                          {item.equipment.brand && (
                            <p className="text-sm text-gray-500">{item.equipment.brand}</p>
                          )}
                        </div>
                        <Badge
                          variant={item.equipment.status === "available" ? "default" : "secondary"}
                        >
                          {item.equipment.status}
                        </Badge>
                      </div>

                      {/* Rental Options */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {/* Quantity */}
                        <div>
                          <Label className="text-sm font-medium">Quantity</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(item, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(item, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Rental Type */}
                        <div>
                          <Label className="text-sm font-medium">Rental Type</Label>
                          <Select
                            value={item.rentalType}
                            onValueChange={(value: 'daily' | 'weekly') => handleRentalTypeChange(item, value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Rental Duration */}
                        <div>
                          <Label className="text-sm font-medium">
                            {item.rentalType === 'daily' ? 'Days' : 'Weeks'}
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.rentalType === 'daily' ? item.rentalDays : Math.ceil(item.rentalDays / 7)}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 1;
                              const days = item.rentalType === 'daily' ? value : value * 7;
                              handleRentalDaysChange(item, days);
                            }}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="mt-4 flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">
                            ${item.rentalType === 'daily' ? item.dailyPrice : item.weeklyPrice}
                          </span>
                          <span className="text-gray-500"> per {item.rentalType === 'daily' ? 'day' : 'week'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">
                            ${getItemPrice(item).toLocaleString()}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="text-lg font-semibold">
                Total: ${getTotalPrice().toLocaleString()}
              </div>
              <Button
                variant="outline"
                onClick={clearCart}
                className="text-red-600 hover:text-red-700"
              >
                Clear Cart
              </Button>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Continue Shopping
              </Button>
              <Button
                onClick={() => {
                  onClose();
                  router.push(redirectUrl);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {buttonText}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
