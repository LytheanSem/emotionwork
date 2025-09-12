import Link from "next/link";

export default function FooterSimple() {
  return (
    <footer className="bg-card border-t border-border shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="text-lg font-bold text-foreground">EmotionWork</div>
            <p className="text-sm text-muted-foreground">
              Professional event equipment and services
            </p>
          </div>
          <div className="flex items-center space-x-6">
            <Link
              href="/contact"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/about"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/service"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Services
            </Link>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © 2025 EmotionWork. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
