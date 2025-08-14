"use client";

import { EquipmentGrid } from "@/components/equipment-grid";
import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

function EquipmentPageContent() {
  // Use direct API instead of tRPC for now
  const {
    data: equipmentData,
    error: equipmentError,
    isLoading: equipmentLoading,
  } = useQuery({
    queryKey: ["equipment", "direct"],
    queryFn: async () => {
      const response = await fetch("/api/equipment-data");
      if (!response.ok) {
        throw new Error("Failed to fetch equipment data");
      }
      return response.json();
    },
    retry: 3,
    refetchOnWindowFocus: false,
  });

  // Show loading state
  if (equipmentLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-12 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Our Equipment
          </h1>
          <p className="text-gray-600">
            Professional lighting, sound, and staging equipment for your events
          </p>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading equipment...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (equipmentError) {
    return (
      <div className="container mx-auto px-4 lg:px-12 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Our Equipment
          </h1>
          <p className="text-gray-600">
            Professional lighting, sound, and staging equipment for your events
          </p>
        </div>
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">
            ❌ Error loading equipment data
          </p>
          <p className="text-red-700 text-xs mt-2">{equipmentError.message}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Show real data
  if (
    equipmentData?.success &&
    equipmentData.equipment &&
    equipmentData.categories
  ) {
    return (
      <div className="container mx-auto px-4 lg:px-12 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Our Equipment
              </h1>
              <p className="text-gray-600">
                Professional lighting, sound, and staging equipment for your
                events
              </p>
            </div>
          </div>
        </div>
        <EquipmentGrid
          equipment={equipmentData.equipment}
          categories={equipmentData.categories}
        />
      </div>
    );
  }

  // Fallback if no data
  return (
    <div className="container mx-auto px-4 lg:px-12 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Equipment</h1>
        <p className="text-gray-600">
          Professional lighting, sound, and staging equipment for your events
        </p>
      </div>
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 text-sm">
          ⚠️ No equipment data available
        </p>
        <p className="text-yellow-700 text-xs mt-2">
          Try adding some equipment through the admin panel first.
        </p>
        <Button
          onClick={() => window.open("/admin", "_blank")}
          variant="outline"
          size="sm"
          className="mt-2"
        >
          Go to Admin Panel
        </Button>
      </div>
    </div>
  );
}

export default function EquipmentPage() {
  return (
    <ErrorBoundary>
      <EquipmentPageContent />
    </ErrorBoundary>
  );
}
