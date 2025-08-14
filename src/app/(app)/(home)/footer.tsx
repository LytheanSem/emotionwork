import Link from "next/link";

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <span className="text-2xl font-semibold text-gray-900">LOGO</span>
            <p className="text-sm text-gray-600">
              Professional event equipment and services
            </p>
          </div>
          <div className="flex items-center space-x-6">
            <Link
              href="/contact"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/about"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              About
            </Link>
            <Link
              href="/service"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Services
            </Link>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            © 2024 EmotionWork. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
