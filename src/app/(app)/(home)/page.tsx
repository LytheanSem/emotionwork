import { Button } from "@/components/ui/button";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <div className={`${inter.className} min-h-screen bg-white`}>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Large placeholder image */}
            <div className="bg-gray-200 aspect-[4/3] rounded-lg flex items-center justify-center">
              <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            
            {/* Right side - Title and CTA */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
                Designing Impactful Stages for Every Experience
              </h1>
              <div className="flex justify-center lg:justify-start">
                <Button size="lg" className="bg-white border-2 border-black text-black hover:bg-gray-50 px-8 py-3 text-lg rounded-lg">
                  Get a Quote
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-gray-200"></div>

      {/* About Preview Section */}
      <section className="py-20 px-6 min-h-[80vh] flex items-center">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">About Preview</h2>
              <p className="text-lg text-gray-600 mb-6">
                Two-line intro text goes here. Two-line intro text goes here.
              </p>
              <Button size="lg" variant="outline" className="border-2 border-black text-black hover:bg-gray-50 px-8 py-3 text-lg rounded-lg">
                Meet Us
              </Button>
            </div>
            
            {/* Right side - Square placeholder image */}
            <div className="bg-gray-200 aspect-square rounded-lg flex items-center justify-center">
              <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-gray-200"></div>

      {/* Services Preview Section */}
      <section className="py-20 px-6 min-h-[80vh] flex items-center">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Services Preview</h2>
              <div className="bg-gray-200 aspect-[4/3] rounded-lg flex items-center justify-center mb-6">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            
            {/* Right side - Diamond images and CTA */}
            <div className="text-center lg:text-left">
              <div className="flex justify-center lg:justify-start gap-4 mb-6">
                {/* Three diamond-shaped placeholders */}
                <div className="bg-gray-200 w-20 h-20 transform rotate-45 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400 transform -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="bg-gray-200 w-20 h-20 transform rotate-45 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400 transform -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="bg-gray-200 w-20 h-20 transform rotate-45 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400 transform -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <Button size="lg" variant="outline" className="border-2 border-black text-black hover:bg-gray-50 px-8 py-3 text-lg rounded-lg">
                Explore Services
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-gray-200"></div>

      {/* Portfolio Preview Section */}
      <section className="py-20 px-6 min-h-[80vh] flex items-center">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">Portfolio Preview</h2>
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Three rectangular placeholder images */}
            <div className="bg-gray-200 aspect-[4/3] rounded-lg flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="bg-gray-200 aspect-[4/3] rounded-lg flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="bg-gray-200 aspect-[4/3] rounded-lg flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="flex justify-end">
            <Button size="lg" variant="outline" className="border-2 border-black text-black hover:bg-gray-50 px-8 py-3 text-lg rounded-lg">
              See Projects
            </Button>
          </div>
        </div>
      </section>

      <div className="border-t border-gray-200"></div>

      {/* Bottom Section - Testimonials and Contact Preview */}
      <section className="py-20 px-6 min-h-[80vh] flex items-center">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left side - Testimonials Preview */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Testimonials Preview</h2>
              <p className="text-lg text-gray-600 mb-6">
                "Client testimonial goes here."
              </p>
              <Button size="lg" variant="outline" className="border-2 border-black text-black hover:bg-gray-50 px-8 py-3 text-lg rounded-lg">
                Read More
              </Button>
            </div>
            
            {/* Right side - Contact Preview */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Contact Preview</h2>
              <p className="text-lg text-gray-600 mb-2">
                Introductory text goes here.
              </p>
              <p className="text-lg text-gray-600">
                Additional contact information here.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
