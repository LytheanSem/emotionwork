import { Button } from "@/components/ui/button"; // Make sure to import Button
import { cn } from "@/lib/utils"; // Make sure to import cn
import { Category } from "@/payload-types";

interface Props {
  data: any;
  activeCategory?: string; // Optional: if you want to track active category
  isNavigationHovered?: boolean; // Optional: if you still need this state
}

export const Categories = ({
  data,
  activeCategory,
  isNavigationHovered,
}: Props) => {
  return (
    <div className="flex gap-2">
      {data.map((category: Category) => (
        <Button
          key={category.id}
          variant="elevated"
          className={cn(
            "h-11 px-4 bg-transparent border-transparent rounded-full hover:bg-blue-400 hover:text-white hover:border-primary text-black",
            activeCategory === category.id &&
              !isNavigationHovered &&
              "bg-blue-400 text-white border-primary"
          )}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};
