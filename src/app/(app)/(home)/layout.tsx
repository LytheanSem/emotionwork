import { CartProvider } from "@/contexts/CartContext";
import { Suspense, type ReactNode } from "react";
import { Navbar } from "./navbar";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col">
        <Navbar />
        <main className="flex-1 pt-20">
          <Suspense
            fallback={
              <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            }
          >
            {children}
          </Suspense>
        </main>
      </div>
    </CartProvider>
  );
}
