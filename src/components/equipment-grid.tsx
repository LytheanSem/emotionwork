"use client";

import { Button } from "@/components/ui/button";
import { Equipment } from "@/lib/db";
import dynamic from "next/dynamic";
import React, { Suspense, useState } from "react";
import { EquipmentFallback } from "./equipment-fallback";
import { Badge } from "@/components/ui/badge";

const LazyEquipmentCard = dynamic(
  () =>
    import("./equipment-card").then((mod) => ({ default: mod.EquipmentCard })),
  {
    loading: () => (
      <div className="bg-card rounded-lg shadow-md overflow-hidden animate-pulse border border-border">
        <div className="aspect-square bg-muted"></div>
        <div className="p-4 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
          <div className="h-3 bg-muted rounded w-1/4"></div>
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
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filteredEquipment = selectedCategory
    ? equipment.filter((eq) => eq.categoryId === selectedCategory)
    : equipment;

  // Get the selected category name for display
  const selectedCategoryName = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)?.name
    : null;

  const handleEquipmentClick = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEquipment(null);
  };

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {filteredEquipment.map((item, idx) => (
            <Suspense
              key={item._id ?? `item-${idx}`}
              fallback={
                <div className="bg-card rounded-lg shadow-md overflow-hidden animate-pulse border border-border">
                  <div className="aspect-square bg-muted"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-1/4"></div>
                  </div>
                </div>
              }
            >
              <LazyEquipmentCard 
                equipment={item} 
                onClick={() => handleEquipmentClick(item)}
              />
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

      {/* Equipment Modal */}
      {showModal && selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">{selectedEquipment.name}</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Equipment Image */}
              <div className="relative w-full h-80 bg-gray-200 rounded-lg overflow-hidden mb-6 flex items-center justify-center">
                {selectedEquipment.imageUrl ? (
                  <img
                    src={selectedEquipment.imageUrl}
                    alt={selectedEquipment.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : selectedEquipment.image && typeof selectedEquipment.image === "string" ? (
                  <img
                    src={selectedEquipment.image}
                    alt={selectedEquipment.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="w-20 h-20 border-2 border-gray-400 flex items-center justify-center">
                    <span className="text-gray-400 text-4xl font-bold">×</span>
                  </div>
                )}
              </div>

              {/* Equipment Details */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Badge
                    variant={
                      selectedEquipment.status === "available"
                        ? "default"
                        : selectedEquipment.status === "in_use"
                          ? "secondary"
                          : "destructive"
                    }
                    className="px-4 py-2 text-base"
                  >
                    {selectedEquipment.status}
                  </Badge>
                  {selectedEquipment.brand && (
                    <Badge variant="outline" className="px-4 py-2 text-base">
                      {selectedEquipment.brand}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Quantity</h3>
                    <p className="text-gray-600">{selectedEquipment.quantity}</p>
                  </div>
                  {selectedEquipment.categoryId && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Category</h3>
                      <p className="text-gray-600">
                        {categories.find(c => c.id === selectedEquipment.categoryId)?.name || 'Unknown'}
                      </p>
                    </div>
                  )}
                </div>

                {selectedEquipment.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{selectedEquipment.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
