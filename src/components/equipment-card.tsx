"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Equipment } from "@/lib/db";
import { Plus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface EquipmentCardProps {
  equipment: Equipment;
  onClick?: () => void;
}

function resolveImageSrc(equipment: { imageUrl?: string; image?: string | File }): string | null {
  // Prioritize Cloudinary imageUrl
  if (equipment.imageUrl) {
    return equipment.imageUrl;
  }

  // Fallback to legacy image field if it exists
  if (equipment.image && typeof equipment.image === "string") {
    // Accept absolute URLs or root-relative paths
    const isAbsolute = /^https?:\/\//i.test(equipment.image);
    const isRootRelative = equipment.image.startsWith("/");
    if (isAbsolute || isRootRelative) return equipment.image;

    // Handle GridFS URLs (they start with /api/files/)
    if (equipment.image.startsWith("/api/files/")) return equipment.image;
  }

  // No valid image found
  return "/placeholder-equipment.svg";
}

export function EquipmentCard({ equipment, onClick }: EquipmentCardProps) {
  const imageSrc = resolveImageSrc(equipment);
  const [isImageVisible, setIsImageVisible] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showAddToCart, setShowAddToCart] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsImageVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "50px", // Start loading 50px before the image comes into view
        threshold: 0.1,
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    addToCart(equipment, 1, "daily", 1);
  };

  return (
    <div
      className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-cyan-500/20 relative group hover:scale-105 hover:border-cyan-400/40"
      onClick={onClick}
      onMouseEnter={() => setShowAddToCart(true)}
      onMouseLeave={() => setShowAddToCart(false)}
    >
      {imageSrc && (
        <div ref={imageRef} className="aspect-square overflow-hidden bg-slate-600/50">
          {isImageVisible ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              <Image
                src={imageSrc}
                alt={equipment.name}
                width={400}
                height={400}
                className={`max-w-full max-h-full object-contain transition-all duration-300 ${
                  isImageLoaded ? "hover:scale-105" : "blur-sm"
                }`}
                onLoad={() => setIsImageLoaded(true)}
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
            </div>
          ) : (
            <div className="w-full h-full bg-slate-600/50 animate-pulse flex items-center justify-center">
              <div className="text-cyan-200 text-sm">Loading...</div>
            </div>
          )}
        </div>
      )}

      {/* Add to Cart Button Overlay */}
      {showAddToCart && equipment.status === "available" && (
        <div className="absolute top-2 right-2 z-10">
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-white line-clamp-2">{equipment.name}</h3>
          <div className="flex flex-col items-end gap-1">
            <Badge
              variant={
                equipment.status === "available"
                  ? "default"
                  : equipment.status === "in_use"
                    ? "secondary"
                    : "destructive"
              }
              className="flex-shrink-0"
            >
              {equipment.status}
            </Badge>
            {equipment.brand && <span className="text-sm text-cyan-200">{equipment.brand}</span>}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-cyan-100/80">Quantity: {equipment.quantity}</span>
          </div>

          {equipment.length && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-cyan-100/80">Length: {equipment.length}m</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
