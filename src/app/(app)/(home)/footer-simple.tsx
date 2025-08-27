import Link from "next/link";

export default function FooterSimple() {
  return (
    <footer className="bg-white border-t border-gray-200 shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="text-lg font-bold text-gray-900">EmotionWork</div>
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
            © 2025 EmotionWork. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
