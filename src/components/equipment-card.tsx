import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Equipment } from "@/payload-types";
import Image from "next/image";

interface EquipmentCardProps {
  equipment: Equipment;
}

export function EquipmentCard({ equipment }: EquipmentCardProps) {
  const imageUrl =
    equipment.image &&
    typeof equipment.image === "object" &&
    equipment.image.url
      ? equipment.image.url
      : "/placeholder-equipment.svg";

  // Get category name - handle both populated and unpopulated cases
  const getCategoryName = () => {
    if (equipment.category && typeof equipment.category === "object") {
      return equipment.category.name;
    }
    if (equipment.category && typeof equipment.category === "string") {
      // This shouldn't happen with depth: 2, but fallback just in case
      return "Loading...";
    }
    return "Uncategorized";
  };

  const categoryName = getCategoryName();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="aspect-square relative overflow-hidden">
        <Image
          src={imageUrl}
          alt={equipment.name}
          fill
          className="object-cover hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            // Fallback to a data URL if the image fails to load
            const target = e.target as HTMLImageElement;
            target.src =
              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNGM0Y0RjYiLz4KICA8cmVjdCB4PSIxMDAiIHk9IjEwMCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNEMUQ1REIiIHJ4PSI4Ii8+CiAgPGNpcmNsZSBjeD0iMjAwIiBjeT0iMjAwIiByPSI0MCIgZmlsbD0iIzlDQTNBRiIvPgogIDxwYXRoIGQ9Ik0xODAgMjAwIEwyMjAgMjAwIE0yMDAgMTgwIEwyMDAgMjIwIiBzdHJva2U9IiM2QjcyODAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=";
          }}
        />
        <div className="absolute top-2 right-2">
          <Badge
            variant={equipment.status === "available" ? "default" : "secondary"}
          >
            {equipment.status === "available"
              ? "Available"
              : equipment.status === "in_use"
                ? "In Use"
                : equipment.status === "maintenance"
                  ? "Maintenance"
                  : "Out of Service"}
          </Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg leading-tight">
            {equipment.name}
          </h3>
          {equipment.brand && (
            <p className="text-sm text-muted-foreground">{equipment.brand}</p>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {categoryName}
          </Badge>
          <div className="text-right">
            <p className="text-sm font-medium">
              Quantity:{" "}
              <span className="text-primary">{equipment.quantity}</span>
            </p>
            {equipment.specifications?.power && (
              <p className="text-xs text-muted-foreground">
                {equipment.specifications.power}
              </p>
            )}
          </div>
        </div>
        {equipment.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {equipment.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
