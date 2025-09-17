"use client";
import { Button } from "@/components/ui/button";
import { Source_Sans_3 } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const sourceSans3 = Source_Sans_3({ 
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"]
});

// Stage images array
const stageImages = [
  { src: "/uploads/stages/IMG_1108.JPG", alt: "Professional stage design showcase" },
  { src: "/uploads/stages/IMG_1113.JPG", alt: "Indoor event stage setup" },
  { src: "/uploads/stages/IMG_2195.JPG", alt: "Outdoor concert stage design" },
  { src: "/uploads/stages/IMG_4202.jpg", alt: "Corporate event stage" },
  { src: "/uploads/stages/IMG_5087.JPG", alt: "Festival stage design" },
  { src: "/uploads/stages/IMG_5405.JPG", alt: "Award ceremony stage" },
  { src: "/uploads/stages/IMG_6710.JPG", alt: "Concert stage setup" },
  { src: "/uploads/stages/IMG_7058.JPG", alt: "Event stage design" },
  { src: "/uploads/stages/IMG_7799.jpg", alt: "Professional stage construction" },
  { src: "/uploads/stages/IMG_9933.jpg", alt: "Custom stage design" },
  { src: "/uploads/stages/indoor.JPG", alt: "Indoor stage setup" },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % stageImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % stageImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + stageImages.length) % stageImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className={`${sourceSans3.className} min-h-screen bg-gray-50`}>
      {/* Hero Carousel Section */}
      <section className="relative h-[75vh] overflow-hidden">
        {/* Carousel Container */}
        <div className="relative w-full h-full">
          {stageImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                priority={index === 0}
                loading={index <= 1 ? "eager" : "lazy"}
                sizes="100vw"
                quality={85}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50"></div>
            </div>
          ))}
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center text-white px-6 max-w-5xl mx-auto">
            <div className="mb-8">
              <div className="w-16 h-0.5 bg-white mx-auto mb-6"></div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-none drop-shadow-2xl">
                <span className="text-white drop-shadow-2xl font-black" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)'}}>VISUAL</span>
                <br />
                <span className="font-black text-cyan-300 drop-shadow-2xl" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)'}}>EMOTIONWORK</span>
              </h1>
              <p className="text-lg md:text-xl text-white font-semibold max-w-2xl mx-auto leading-relaxed drop-shadow-2xl" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.5)'}}>
                Professional sound and lighting solutions since 2013
              </p>
            </div>
            
            <div className="flex justify-center">
              <Link href="/design">
                <Button 
                  size="lg" 
                  className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg font-medium rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Start Your Project
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
          {stageImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? "bg-white" : "bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">Why Choose Us</h2>
            <div className="w-16 h-0.5 bg-cyan-500 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {/* Innovation */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Innovation</h3>
              <p className="text-gray-600 leading-relaxed">Cutting-edge design and technology for modern events</p>
            </div>
            
            {/* Quality */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Quality</h3>
              <p className="text-gray-600 leading-relaxed">Premium materials and precision in every project</p>
            </div>
            
            {/* Collaboration */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Collaboration</h3>
              <p className="text-gray-600 leading-relaxed">Your vision, our expertise working together</p>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">Our Portfolio</h2>
            <div className="w-16 h-0.5 bg-cyan-500 mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Showcasing our expertise across indoor and outdoor event spaces
            </p>
          </div>

          {/* Portfolio Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Indoor Events Card */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl group">
              <div className="relative aspect-[4/3]">
                <Image
                  src="/uploads/stages/IMG_1113.JPG"
                  alt="Indoor Events"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-8 left-8 text-white">
                  <h3 className="text-2xl font-semibold mb-3">Indoor Events</h3>
                  <p className="text-gray-200 text-lg">Corporate conferences, award ceremonies, and intimate gatherings</p>
                </div>
              </div>
            </div>

            {/* Outdoor Events Card */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl group">
              <div className="relative aspect-[4/3]">
                <Image
                  src="/uploads/stages/IMG_1108.JPG"
                  alt="Outdoor Events"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-8 left-8 text-white">
                  <h3 className="text-2xl font-semibold mb-3">Outdoor Events</h3>
                  <p className="text-gray-200 text-lg">Concerts, festivals, and large-scale productions</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Link href="/portfolio">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
              >
                View All Projects
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">Our Services</h2>
            <div className="w-16 h-0.5 bg-cyan-500 mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              From concept to completion, we deliver exceptional stage design solutions
            </p>
          </div>

          {/* Service Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Professional Sound System */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Sound System</h3>
              <p className="text-gray-600 leading-relaxed">
                High-quality sound equipment rental for concerts, events, and productions.
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
                Advanced lighting solutions to create stunning visual experiences for your events.
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
                High-resolution LED displays and professional projectors for visual presentations.
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
                Creative 3D visual effects and comprehensive production design services.
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

          {/* CTA Button */}
          <div className="text-center">
            <Link href="/service">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Explore All Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6">Ready to Get Started?</h2>
          <div className="w-16 h-0.5 bg-cyan-500 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg mb-12 max-w-2xl mx-auto">
            Let&apos;s discuss your project and bring your vision to life. Contact us today for a consultation.
          </p>
          
          {/* Contact Information */}
          <div className="grid md:grid-cols-2 gap-8 mb-16 text-left">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-gray-600">#633, St 75K, S/K Kakap, Khan Posenchey, Phnom Penh City</span>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <span className="text-gray-600">(+855) 98 505079</span>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-gray-600">visualemotion@gmail.com</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Our Projects</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                  </div>
                  <span className="text-gray-600">Outdoor concerts</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                  </div>
                  <span className="text-gray-600">Indoor concerts</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                  </div>
                  <span className="text-gray-600">Weddings</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                  </div>
                  <span className="text-gray-600">Cultural events</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/bookmeeting">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Schedule Consultation
              </Button>
            </Link>
            <Link href="/contact">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-500 hover:text-white px-8 py-4 text-lg rounded-full transition-all duration-300"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}