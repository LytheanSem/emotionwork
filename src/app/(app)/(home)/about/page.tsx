import { Button } from "@/components/ui/button";
import { Source_Sans_3 } from "next/font/google";
import Link from "next/link";

const sourceSans3 = Source_Sans_3({ 
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"]
});

export default function About() {
  return (
    <div className={`${sourceSans3.className} min-h-screen bg-gray-50`}>
      {/* Hero Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-0.5 bg-cyan-500 mx-auto mb-8"></div>
          <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-8 leading-none text-gray-900">
            ABOUT
            <br />
            <span className="font-thin text-cyan-500">VISUAL EMOTIONWORK</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
            Professional sound and lighting solutions since 2013
          </p>
        </div>
      </section>

      {/* Company Story Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">Our Story</h2>
            <div className="w-16 h-0.5 bg-cyan-500 mx-auto"></div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6 text-gray-600 text-lg leading-relaxed text-center">
              <p>
                Visual Emotionwork was established in 2013 as a professional sound and lighting solution provider in Cambodia. With the aim of bringing the best quality of service and experience to customers, we have constantly made efforts in upgrading the quality of equipment as well as improving service quality.
              </p>
              <p>
                Visual Emotionwork is currently serving domestic and foreign events on a large and small scale. With certain successes since its establishment, we want the future to bring you the best experience from what we have.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6">Our Vision</h2>
          <div className="w-16 h-0.5 bg-cyan-500 mx-auto mb-12"></div>
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <p className="text-xl text-gray-600 leading-relaxed">
              To be a leading event production resource that delivers high-quality, professional services to support all our client&apos;s projects.
            </p>
          </div>
        </div>
      </section>

      {/* Services Overview Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">What We Do</h2>
            <div className="w-16 h-0.5 bg-cyan-500 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide comprehensive event production services with professional equipment and expert support
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Professional Sound System */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Sound System</h3>
              <p className="text-gray-600 leading-relaxed">
                High-quality sound equipment rental for concerts, events, and productions with expert setup and support.
              </p>
            </div>

            {/* Professional Lighting System */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Lighting System</h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced lighting solutions to create stunning visual experiences for your events and productions.
              </p>
            </div>

            {/* LED Screen & Projector */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m0 0h8m-8 0v16a1 1 0 001 1h6a1 1 0 001-1V4H7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">LED Screen & Projector</h3>
              <p className="text-gray-600 leading-relaxed">
                High-resolution LED displays and professional projectors for visual presentations and displays.
              </p>
            </div>

            {/* 3D Visual & Production Design */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3D Visual & Production Design</h3>
              <p className="text-gray-600 leading-relaxed">
                Creative 3D visual effects and comprehensive production design services for memorable events.
              </p>
            </div>

            {/* Stage & Truss Structure */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Stage & Truss Structure</h3>
              <p className="text-gray-600 leading-relaxed">
                Professional stage construction and truss systems for safe, secure event setups.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-light mb-4">Ready to Work With Us?</h2>
          <div className="w-12 h-0.5 bg-white mx-auto mb-6"></div>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Let&apos;s discuss your next event and bring your vision to life with our professional services.
          </p>
          <div className="flex justify-center">
            <Button 
              size="lg" 
              className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 text-lg rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
              asChild
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}