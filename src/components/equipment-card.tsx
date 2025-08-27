"use client";

import { Badge } from "@/components/ui/badge";
import { Equipment } from "@/lib/db";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface EquipmentCardProps {
  equipment: Equipment;
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

export function EquipmentCard({ equipment }: EquipmentCardProps) {
  const imageSrc = resolveImageSrc(equipment);
  const [isImageVisible, setIsImageVisible] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
             {imageSrc && (
         <div ref={imageRef} className="aspect-square overflow-hidden bg-gray-50">
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
             <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
               <div className="text-gray-400 text-sm">Loading...</div>
             </div>
           )}
         </div>
       )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {equipment.name}
          </h3>
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
                         {equipment.brand && (
               <span className="text-sm text-gray-500">
                 {equipment.brand}
               </span>
             )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Quantity: {equipment.quantity}
          </span>
        </div>
      </div>
    </div>
  );
}
