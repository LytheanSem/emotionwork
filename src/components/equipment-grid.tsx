"use client";

import { Button } from "@/components/ui/button";
import { Equipment } from "@/lib/db";
import dynamic from "next/dynamic";
import React, { Suspense, useState } from "react";
import { EquipmentFallback } from "./equipment-fallback";

const LazyEquipmentCard = dynamic(
  () =>
    import("./equipment-card").then((mod) => ({ default: mod.EquipmentCard })),
  {
    loading: () => (
      <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
        <div className="aspect-square bg-gray-200"></div>
        <div className="p-4 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    ),
    ssr: false,
  }
);

interface EquipmentGridProps {
  equipment: Equipment[];
  categories: Array<{ id: string; name: string; slug: string }>;
}

export function EquipmentGrid({ equipment, categories }: EquipmentGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredEquipment = selectedCategory
    ? equipment.filter((eq) => eq.categoryId === selectedCategory)
    : equipment;

  // Get the selected category name for display
  const selectedCategoryName = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)?.name
    : null;

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
          className="text-sm"
        >
          All Categories
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
            className="text-sm"
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Equipment Count */}
      <div className="text-sm text-muted-foreground">
        {filteredEquipment.length} equipment item
        {filteredEquipment.length !== 1 ? "s" : ""}
        {selectedCategory && ` in ${selectedCategoryName}`}
      </div>

      {/* Equipment Grid - Simple CSS Grid Layout */}
      {filteredEquipment.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEquipment.map((item, idx) => (
            <Suspense
              key={item._id ?? `item-${idx}`}
              fallback={
                <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              }
            >
              <LazyEquipmentCard equipment={item} />
            </Suspense>
          ))}
        </div>
      ) : (
        <EquipmentFallback
          title="No Equipment Found"
          message={
            selectedCategory
              ? `No equipment found in the "${selectedCategoryName}" category.`
              : "No equipment has been added yet. Start by adding some equipment through the admin panel."
          }
          showAddEquipment={!selectedCategory}
        />
      )}
    </div>
  );
}
