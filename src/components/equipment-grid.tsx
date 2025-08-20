"use client";

import { Button } from "@/components/ui/button";
import { Equipment } from "@/lib/db";
import { useState } from "react";
import { EquipmentCard } from "./equipment-card";
import { EquipmentFallback } from "./equipment-fallback";

interface EquipmentWithId extends Equipment {
  id: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    description?: string;
  };
}

interface EquipmentGridProps {
  equipment: EquipmentWithId[];
  categories: Array<{ id: string; name: string; slug: string }>;
}

export function EquipmentGrid({ equipment, categories }: EquipmentGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredEquipment = selectedCategory
    ? equipment.filter((eq) => eq.categoryId === selectedCategory)
    : equipment;

  const handleCategoryFilter = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

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
          size="sm"
          onClick={() => handleCategoryFilter(null)}
        >
          All Equipment
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryFilter(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Equipment Count */}
      <div className="text-sm text-muted-foreground">
        {selectedCategory
          ? `Showing ${filteredEquipment.length} of ${equipment.length} equipment in "${selectedCategoryName}"`
          : `Showing ${filteredEquipment.length} of ${equipment.length} equipment`}
      </div>

      {/* Equipment Grid */}
      {filteredEquipment.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEquipment.map((item, idx) => (
            <EquipmentCard
              key={item.id ?? `${item._id ?? "i"}-${idx}`}
              equipment={item}
            />
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
