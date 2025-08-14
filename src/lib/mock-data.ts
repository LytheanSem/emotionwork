export const mockCategories = [
  {
    id: "mock-1",
    name: "Lighting Consoles",
    slug: "lighting-consoles",
    color: "#3B82F6",
  },
  {
    id: "mock-2",
    name: "Moving Heads",
    slug: "moving-heads",
    color: "#10B981",
  },
  {
    id: "mock-3",
    name: "LED Lights",
    slug: "led-lights",
    color: "#F59E0B",
  },
  {
    id: "mock-4",
    name: "Staging Equipment",
    slug: "staging-equipment",
    color: "#8B5CF6",
  },
  {
    id: "mock-5",
    name: "Effects",
    slug: "effects",
    color: "#EF4444",
  },
];

export const mockEquipment = [
  {
    id: "mock-eq-1",
    name: "GrandMA (Made in China)",
    brand: "GrandMA",
    quantity: 1,
    category: mockCategories[0],
    status: "available",
    specifications: {
      power: "2000W",
    },
    description: "Professional lighting console for large events",
  },
  {
    id: "mock-eq-2",
    name: "Moving Head Beam 330",
    brand: "LQE",
    quantity: 50,
    category: mockCategories[1],
    status: "available",
    specifications: {
      power: "330W",
    },
    description: "High-performance moving head beam light",
  },
  {
    id: "mock-eq-3",
    name: "Matrix LED Light",
    brand: "Colorful",
    quantity: 16,
    category: mockCategories[2],
    status: "available",
    specifications: {
      power: "100W",
    },
    description: "Versatile LED matrix panel for creative lighting",
  },
  {
    id: "mock-eq-4",
    name: "Truss 0.68m x 0.48m",
    brand: "Professional",
    quantity: 200,
    category: mockCategories[3],
    status: "available",
    specifications: {
      power: "N/A",
    },
    description: "Heavy-duty truss system for stage construction",
  },
  {
    id: "mock-eq-5",
    name: "Smoke Machine 3000W",
    brand: "Professional",
    quantity: 8,
    category: mockCategories[4],
    status: "available",
    specifications: {
      power: "3000W",
    },
    description: "High-capacity smoke machine for atmospheric effects",
  },
];
