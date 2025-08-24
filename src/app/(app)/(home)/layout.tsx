import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Navbar } from "./navbar";

// Lazy load footer component
const LazyFooter = dynamic(
  () => import("./footer").then((mod) => ({ default: mod.Footer })),
  {
    loading: () => <div className="h-24 bg-gray-100 animate-pulse" />,
  }
);

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-24 pb-24">
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
      <Suspense fallback={<div className="h-24 bg-gray-100 animate-pulse" />}>
        <LazyFooter />
      </Suspense>
    </div>
  );
}
