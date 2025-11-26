"use client";

import { Source_Sans_3 } from "next/font/google";
import { useEffect, useState } from "react";

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

const ContactPage = () => {
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatch by only rendering after client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state during hydration to prevent mismatch
  if (!isClient) {
    return (
      <div
        className={`${sourceSans3.className} min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900`}
      >
        <div className="bg-white py-16 px-6 border-b border-gray-200">
          <div className="max-w-6xl mx-auto text-center">
            <div className="h-12 bg-gray-200 rounded animate-pulse mb-4"></div>
          </div>
        </div>
        <div className="bg-white py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-8"></div>
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i}>
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-8"></div>
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${sourceSans3.className} min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900`}>
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10 py-16 px-6 border-b border-cyan-500/20">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Let&apos;s bring your vision to life – contact us today.
          </h1>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-gradient-to-br from-white/90 via-blue-50/30 to-cyan-50/30 backdrop-blur-sm py-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Contact Information */}
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-12">Contact Information</h2>

            <div className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-cyan-500/20">
              <div className="space-y-8">
                {/* Address */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-white mb-1">Address</h3>
                    <p className="text-cyan-100/80">#633, St 75K, S/K Kakap, Khan Posenchey, Phnom Penh City</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-white mb-1">Phone</h3>
                    <p className="text-cyan-100/80">(+855) 98 505079</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-white mb-1">Email</h3>
                    <p className="text-cyan-100/80">visualemotion@gmail.com</p>
                  </div>
                </div>

                {/* Facebook Link */}
                <div className="flex items-center space-x-4">
                  <a
                    href="https://www.facebook.com/reaksonz/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-white mb-1">Facebook</h3>
                    <p className="text-cyan-100/80">Follow us on Facebook</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-10 text-sm text-gray-900 max-w-2xl mx-auto">
              We typically respond within 24 hours on business days. For urgent inquiries, please reach out by phone or
              Facebook for the fastest response.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
