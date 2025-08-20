import { Badge } from "@/components/ui/badge";
import { Equipment } from "@/lib/db";

interface EquipmentCardProps {
  equipment: Equipment;
}

function resolveImageSrc(image?: string | File): string | null {
  if (!image) return null;

  // If image is a File object, we can't display it directly in the frontend
  // This should only happen during form submission, not display
  if (image instanceof File) {
    return "/placeholder-equipment.svg";
  }

  // Handle string images (URLs or paths)
  if (typeof image === "string") {
    // Accept absolute URLs or root-relative paths
    const isAbsolute = /^https?:\/\//i.test(image);
    const isRootRelative = image.startsWith("/");
    if (isAbsolute || isRootRelative) return image;
    // Unknown format (e.g., ObjectId). Use placeholder instead
    return "/placeholder-equipment.svg";
  }

  return "/placeholder-equipment.svg";
}

export function EquipmentCard({ equipment }: EquipmentCardProps) {
  const imageSrc = resolveImageSrc(equipment.image);
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {imageSrc && (
        <div className="aspect-square overflow-hidden">
          <img
            src={imageSrc}
            alt={equipment.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {equipment.name}
          </h3>
          <Badge
            variant={
              equipment.status === "available"
                ? "default"
                : equipment.status === "in_use"
                  ? "secondary"
                  : "destructive"
            }
            className="ml-2 flex-shrink-0"
          >
            {equipment.status}
          </Badge>
        </div>

        {equipment.brand && (
          <p className="text-sm text-gray-600 mb-2">Brand: {equipment.brand}</p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Quantity: {equipment.quantity}
          </span>

          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
