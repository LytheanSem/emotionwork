import { Button } from "@/components/ui/button";

interface EquipmentFallbackProps {
  title: string;
  message: string;
  showRetry?: boolean;
  showAddEquipment?: boolean;
}

export function EquipmentFallback({
  title,
  message,
  showRetry = false,
  showAddEquipment = false,
}: EquipmentFallbackProps) {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <svg
          className="w-16 h-16 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{message}</p>

      <div className="flex gap-3 justify-center">
        {showRetry && (
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        )}

        {showAddEquipment && (
          <Button
            onClick={() => window.open("/admin", "_blank", "noopener,noreferrer")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add Equipment
          </Button>
        )}
      </div>
    </div>
  );
}
