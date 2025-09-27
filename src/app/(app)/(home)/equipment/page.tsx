"use client";

import { EquipmentGrid } from "@/components/equipment-grid";
import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

function EquipmentPageContent() {
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const bookingId = searchParams.get("bookingId");

  // Cache is now properly managed with staleTime and cacheTime

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
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Show loading state
  if (equipmentLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-6 pb-32">
        <div className="w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Our Equipment</h1>
            <p className="text-cyan-100/80">Professional lighting, sound, and staging equipment for your events</p>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-cyan-100/80">Loading equipment...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (equipmentError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-6 pb-32">
        <div className="w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Our Equipment</h1>
            <p className="text-cyan-100/80">Professional lighting, sound, and staging equipment for your events</p>
          </div>
          <div className="mt-4 p-4 bg-red-500/20 border border-red-400/30 rounded-lg backdrop-blur-sm">
            <p className="text-red-200 text-sm">❌ Error loading equipment data</p>
            <p className="text-red-300 text-xs mt-2">{equipmentError.message}</p>
            <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="mt-2">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show real data
  if (equipmentData?.success && equipmentData.equipment && equipmentData.categories) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-6 pb-32">
        <div className="w-full">
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Our Equipment</h1>
                <p className="text-cyan-100/80">Professional lighting, sound, and staging equipment for your events</p>
              </div>
            </div>
          </div>
          <EquipmentGrid
            equipment={equipmentData.equipment}
            categories={equipmentData.categories}
            redirectUrl={isEditMode && bookingId ? `/my-stage-bookings/${bookingId}?edit=true` : "/book-stage"}
            buttonText={isEditMode ? "Back to Edit Booking" : "Proceed to Book Stage"}
          />
        </div>
      </div>
    );
  }

  // Fallback if no data
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-6 pb-32">
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Our Equipment</h1>
          <p className="text-cyan-100/80">Professional lighting, sound, and staging equipment for your events</p>
        </div>
        <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg backdrop-blur-sm">
          <p className="text-yellow-200 text-sm">⚠️ No equipment data available</p>
          <p className="text-yellow-300 text-xs mt-2">Try adding some equipment through the admin panel first.</p>
          <Button
            onClick={() => window.open("/admin", "_blank", "noopener,noreferrer")}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            Go to Admin Panel
          </Button>
        </div>
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
