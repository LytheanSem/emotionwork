"use client";
import { Button } from "@/components/ui/button";
import { Source_Sans_3 } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

// Stage images array
const stageImages = [
  { src: "/stages/IMG_1108.JPG", alt: "Professional stage design showcase" },
  { src: "/stages/IMG_1113.JPG", alt: "Indoor event stage setup" },
  { src: "/stages/IMG_2195.JPG", alt: "Outdoor concert stage design" },
  { src: "/stages/IMG_4202.jpg", alt: "Corporate event stage" },
  { src: "/stages/IMG_5087.JPG", alt: "Festival stage design" },
  { src: "/stages/IMG_5405.JPG", alt: "Award ceremony stage" },
  { src: "/stages/IMG_6710.JPG", alt: "Concert stage setup" },
  { src: "/stages/IMG_7058.JPG", alt: "Event stage design" },
  { src: "/stages/IMG_7799.jpg", alt: "Professional stage construction" },
  { src: "/stages/IMG_9933.jpg", alt: "Custom stage design" },
  { src: "/stages/indoor.JPG", alt: "Indoor stage setup" },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  // Auto-advance carousel (slower for better performance)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % stageImages.length);
    }, 8000); // Increased from 5000ms to 8000ms

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
    <div className={`${sourceSans3.className} min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900`}>
      {/* Hero Carousel Section */}
      <section ref={heroRef} className="relative h-screen overflow-hidden -mt-20 pt-20">
        {/* Simplified Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-purple-600/20"></div>
        </div>

        {/* Carousel Container */}
        <div className="relative w-full h-full z-10">
          {stageImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ${
                index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
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
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"></div>
              {/* Static overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-600/10"></div>
            </div>
          ))}
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center text-white px-6 max-w-6xl mx-auto">
            <div className="mb-12">
              {/* Static divider */}
              <div className="relative mb-8">
                <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full"></div>
              </div>

              {/* Main heading with simplified effects */}
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight mb-8 leading-none">
                <span className="text-white inline-block">VISUAL</span>
                <br />
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-500 inline-block">
                  EMOTIONWORK
                </span>
              </h1>

              {/* Enhanced subtitle */}
              <div className="relative">
                <p className="text-xl md:text-2xl text-white/90 font-semibold max-w-3xl mx-auto leading-relaxed mb-4">
                  Professional sound and lighting solutions since 2013
                </p>
                <p className="text-lg md:text-xl text-cyan-200/80 font-medium max-w-2xl mx-auto leading-relaxed">
                  Creating unforgettable experiences through cutting-edge technology and creative design
                </p>
                {/* Static underline */}
                <div className="w-32 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mt-4 rounded-full"></div>
              </div>
            </div>

            {/* Enhanced CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/design">
                <Button
                  size="lg"
                  className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-10 py-5 text-xl font-bold rounded-full transition-all duration-300 hover:scale-110 shadow-2xl overflow-hidden"
                >
                  <span className="relative z-10">Start Your Project</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </Button>
              </Link>
              <Link href="/portfolio">
                <Button
                  size="lg"
                  variant="outline"
                  className="group border-2 border-white/30 text-blue-500 hover:bg-white/10 hover:border-white/50 px-10 py-5 text-xl font-bold rounded-full transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                >
                  View Our Work
                  <svg
                    className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="group absolute left-6 top-1/2 transform -translate-y-1/2 z-30 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-md hover:from-cyan-500/30 hover:to-blue-600/30 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 border border-white/20 hover:border-white/40"
        >
          <svg
            className="w-6 h-6 group-hover:translate-x-[-2px] transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="group absolute right-6 top-1/2 transform -translate-y-1/2 z-30 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-md hover:from-cyan-500/30 hover:to-blue-600/30 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 border border-white/20 hover:border-white/40"
        >
          <svg
            className="w-6 h-6 group-hover:translate-x-[2px] transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Enhanced Dots Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-4">
          {stageImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`group relative w-4 h-4 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-gradient-to-r from-cyan-400 to-blue-500 scale-125 shadow-lg shadow-cyan-500/50"
                  : "bg-white/40 hover:bg-white/60 hover:scale-110"
              }`}
            >
              {index === currentSlide && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-ping opacity-30"></div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Enhanced Core Values Section */}
      <section className="py-32 px-6 bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/30 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block mb-6">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4">
                Why Choose
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
                  Us
                </span>
              </h2>
            </div>
            <div className="relative">
              <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full"></div>
              <div className="absolute inset-0 w-24 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full blur-sm opacity-50"></div>
            </div>
            <p className="text-xl text-gray-600 mt-6 max-w-2xl mx-auto">
              We bring your vision to life with unmatched expertise and cutting-edge technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Innovation */}
            <div className="group text-center relative">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 via-cyan-400 to-blue-600 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl shadow-cyan-500/25">
                  <svg
                    className="w-12 h-12 text-white group-hover:scale-110 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl mx-auto blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-cyan-600 transition-colors duration-300">
                Innovation
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Cutting-edge design and technology for modern events that captivate and inspire
              </p>
            </div>

            {/* Quality */}
            <div className="group text-center relative">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-blue-400 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl shadow-blue-500/25">
                  <svg
                    className="w-12 h-12 text-white group-hover:scale-110 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl mx-auto blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                Quality
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Premium materials and precision craftsmanship in every project we deliver
              </p>
            </div>

            {/* Collaboration */}
            <div className="group text-center relative">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-600 via-blue-500 to-blue-700 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl shadow-cyan-600/25">
                  <svg
                    className="w-12 h-12 text-white group-hover:scale-110 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 w-24 h-24 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-3xl mx-auto blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-cyan-600 transition-colors duration-300">
                Collaboration
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Your vision meets our expertise in perfect harmony to create unforgettable experiences
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Portfolio Section */}
      <section className="py-32 px-6 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10"></div>
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Enhanced Section Header */}
          <div className="text-center mb-20">
            <div className="inline-block mb-8">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4">
                Our
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  Portfolio
                </span>
              </h2>
            </div>
            <div className="relative mb-6">
              <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full"></div>
              <div className="absolute inset-0 w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full blur-sm opacity-50"></div>
            </div>
            <p className="text-xl text-cyan-100/80 max-w-3xl mx-auto leading-relaxed">
              Showcasing our expertise across indoor and outdoor event spaces with stunning visual experiences
            </p>
          </div>

          {/* Enhanced Portfolio Cards */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-20">
            {/* Indoor Events Card */}
            <div className="group relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-cyan-500/25 transition-all duration-500">
              <div className="relative aspect-[4/3]">
                <Image
                  src="/stages/IMG_1113.JPG"
                  alt="Indoor Events"
                  fill
                  className="object-cover transition-all duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-8 left-8 text-white z-10">
                  <div className="mb-4">
                    <h3 className="text-3xl font-bold mb-3 group-hover:text-cyan-300 transition-colors duration-300">
                      Indoor Events
                    </h3>
                    <p className="text-cyan-100 text-lg leading-relaxed">
                      Corporate conferences, award ceremonies, and intimate gatherings
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Outdoor Events Card */}
            <div className="group relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-blue-500/25 transition-all duration-500">
              <div className="relative aspect-[4/3]">
                <Image
                  src="/stages/IMG_1108.JPG"
                  alt="Outdoor Events"
                  fill
                  className="object-cover transition-all duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-8 left-8 text-white z-10">
                  <div className="mb-4">
                    <h3 className="text-3xl font-bold mb-3 group-hover:text-blue-300 transition-colors duration-300">
                      Outdoor Events
                    </h3>
                    <p className="text-blue-100 text-lg leading-relaxed">
                      Concerts, festivals, and large-scale productions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced CTA Button */}
          <div className="text-center">
            <Link href="/portfolio">
              <Button
                size="lg"
                className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-12 py-6 text-xl font-bold rounded-full transition-all duration-300 hover:scale-110 shadow-2xl overflow-hidden"
              >
                <span className="relative z-10">View All Projects</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <svg
                  className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300 relative z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Services Section */}
      <section className="py-32 px-6 bg-gradient-to-br from-white via-blue-50/50 to-cyan-50/50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Enhanced Section Header */}
          <div className="text-center mb-20">
            <div className="inline-block mb-8">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4">
                Our
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
                  Services
                </span>
              </h2>
            </div>
            <div className="relative mb-6">
              <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full"></div>
              <div className="absolute inset-0 w-24 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full blur-sm opacity-50"></div>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From concept to completion, we deliver exceptional stage design solutions that bring your vision to life
            </p>
          </div>

          {/* Enhanced Service Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {/* Professional Sound System */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 text-center hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 border border-white/20 hover:border-cyan-200/50">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 via-cyan-400 to-blue-600 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl shadow-cyan-500/25">
                  <svg
                    className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                  </svg>
                </div>
                <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl mx-auto blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-cyan-600 transition-colors duration-300">
                Professional Sound System
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                High-quality sound equipment rental for concerts, events, and productions with crystal-clear audio.
              </p>
            </div>

            {/* Professional Lighting System */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 text-center hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 border border-white/20 hover:border-blue-200/50">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-400 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl shadow-blue-500/25">
                  <svg
                    className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl mx-auto blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                Professional Lighting System
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Advanced lighting solutions to create stunning visual experiences that captivate your audience.
              </p>
            </div>

            {/* LED Screen & Projector */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 text-center hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 border border-white/20 hover:border-cyan-200/50">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-600 via-cyan-500 to-blue-700 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl shadow-cyan-600/25">
                  <svg
                    className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m0 0h8m-8 0v16a1 1 0 001 1h6a1 1 0 001-1V4H7z"
                    />
                  </svg>
                </div>
                <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-3xl mx-auto blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-cyan-600 transition-colors duration-300">
                LED Screen & Projector
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                High-resolution LED displays and professional projectors for stunning visual presentations.
              </p>
            </div>

            {/* 3D Visual & Production Design */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 text-center hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 border border-white/20 hover:border-blue-200/50">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-700 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl shadow-blue-600/25">
                  <svg
                    className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-3xl mx-auto blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                3D Visual & Production Design
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Creative 3D visual effects and comprehensive production design services that bring your vision to life.
              </p>
            </div>

            {/* Stage & Truss Structure */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 text-center hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 border border-white/20 hover:border-cyan-200/50 lg:col-span-2">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-700 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl shadow-cyan-500/25">
                  <svg
                    className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-700 rounded-3xl mx-auto blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-cyan-600 transition-colors duration-300">
                Stage & Truss Structure
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Professional stage construction and truss systems for safe, secure event setups that meet the highest
                standards.
              </p>
            </div>
          </div>

          {/* Enhanced CTA Button */}
          <div className="text-center">
            <Link href="/service">
              <Button
                size="lg"
                className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-12 py-6 text-xl font-bold rounded-full transition-all duration-300 hover:scale-110 shadow-2xl overflow-hidden"
              >
                <span className="relative z-10">Explore All Services</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <svg
                  className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300 relative z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Our Agency Clients Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/30 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4">
                OUR AGENCY
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
                  CLIENTS
                </span>
              </h2>
            </div>
            <div className="relative mb-6">
              <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full"></div>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Trusted by leading brands and organizations across Cambodia
            </p>
          </div>

          {/* Partners Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
            {/* Wing Bank */}
            <div className="group flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20">
              <Image
                src="/partners/wingbank.jpg"
                alt="Wing Bank"
                width={120}
                height={60}
                className="max-w-full h-auto object-contain transition-all duration-300"
              />
            </div>

            {/* iMedia */}
            <div className="group flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20">
              <Image
                src="/partners/imedia.jpg"
                alt="iMedia"
                width={120}
                height={60}
                className="max-w-full h-auto object-contain transition-all duration-300"
              />
            </div>

            {/* Square */}
            <div className="group flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20">
              <Image
                src="/partners/square.jpg"
                alt="Square"
                width={120}
                height={60}
                className="max-w-full h-auto object-contain transition-all duration-300"
              />
            </div>

            {/* Havas */}
            <div className="group flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20">
              <Image
                src="/partners/havas.jpg"
                alt="Havas"
                width={120}
                height={60}
                className="max-w-full h-auto object-contain transition-all duration-300"
              />
            </div>

            {/* ACTI */}
            <div className="group flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20">
              <Image
                src="/partners/acti.jpg"
                alt="ACTI"
                width={120}
                height={60}
                className="max-w-full h-auto object-contain transition-all duration-300"
              />
            </div>

            {/* SKN9 */}
            <div className="group flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20">
              <Image
                src="/partners/skn9.jpg"
                alt="SKN9"
                width={120}
                height={60}
                className="max-w-full h-auto object-contain transition-all duration-300"
              />
            </div>

            {/* Anussa */}
            <div className="group flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20">
              <Image
                src="/partners/Anussa.jpg"
                alt="Anussa"
                width={120}
                height={60}
                className="max-w-full h-auto object-contain transition-all duration-300"
              />
            </div>

            {/* MSA */}
            <div className="group flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20">
              <Image
                src="/partners/msa.jpg"
                alt="MSA"
                width={120}
                height={60}
                className="max-w-full h-auto object-contain transition-all duration-300"
              />
            </div>

            {/* Chip Mong Mall */}
            <div className="group flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20">
              <Image
                src="/partners/chipmong_mall.jpg"
                alt="Chip Mong Mall"
                width={120}
                height={60}
                className="max-w-full h-auto object-contain transition-all duration-300"
              />
            </div>

            {/* Idea Factory */}
            <div className="group flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20">
              <Image
                src="/partners/idea_factory.jpg"
                alt="Idea Factory"
                width={120}
                height={60}
                className="max-w-full h-auto object-contain transition-all duration-300"
              />
            </div>

            {/* MEAS */}
            <div className="group flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20">
              <Image
                src="/partners/meas.jpg"
                alt="MEAS"
                width={120}
                height={60}
                className="max-w-full h-auto object-contain transition-all duration-300"
              />
            </div>

            {/* Compass */}
            <div className="group flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20">
              <Image
                src="/partners/compass.jpg"
                alt="Compass"
                width={120}
                height={60}
                className="max-w-full h-auto object-contain transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Contact Section */}
      <section className="py-32 px-6 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Enhanced Header */}
          <div className="text-center mb-20">
            <div className="inline-block mb-8">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4">
                Ready to Get
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  Started?
                </span>
              </h2>
            </div>
            <div className="relative mb-6">
              <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full"></div>
              <div className="absolute inset-0 w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full blur-sm opacity-50"></div>
            </div>
            <p className="text-xl text-cyan-100/80 max-w-3xl mx-auto leading-relaxed">
              Let&apos;s discuss your project and bring your vision to life. Contact us today for a consultation.
            </p>
          </div>

          {/* Enhanced Contact Information */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <div className="group bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-cyan-300/50 transition-all duration-500 hover:bg-white/15">
              <h3 className="text-2xl font-bold text-white mb-8 group-hover:text-cyan-300 transition-colors duration-300">
                Contact Information
              </h3>
              <div className="space-y-6">
                <div className="flex items-center group/item">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mr-6 group-hover/item:scale-110 transition-transform duration-300">
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
                  <span className="text-cyan-100 text-lg">
                    #633, St 75K, S/K Kakap, Khan Posenchey, Phnom Penh City
                  </span>
                </div>
                <div className="flex items-center group/item">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mr-6 group-hover/item:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <span className="text-cyan-100 text-lg">(+855) 98 505079</span>
                </div>
                <div className="flex items-center group/item">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mr-6 group-hover/item:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <span className="text-cyan-100 text-lg">visualemotion@gmail.com</span>
                </div>
              </div>
            </div>

            <div className="group bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-blue-300/50 transition-all duration-500 hover:bg-white/15">
              <h3 className="text-2xl font-bold text-white mb-8 group-hover:text-blue-300 transition-colors duration-300">
                Our Projects
              </h3>
              <div className="space-y-4">
                <div className="flex items-center group/item">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 group-hover/item:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                  </div>
                  <span className="text-cyan-100 text-lg">Outdoor concerts</span>
                </div>
                <div className="flex items-center group/item">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 group-hover/item:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                  </div>
                  <span className="text-cyan-100 text-lg">Indoor concerts</span>
                </div>
                <div className="flex items-center group/item">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 group-hover/item:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                  </div>
                  <span className="text-cyan-100 text-lg">Weddings</span>
                </div>
                <div className="flex items-center group/item">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 group-hover/item:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                  </div>
                  <span className="text-cyan-100 text-lg">Cultural events</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/book-meeting">
              <Button
                size="lg"
                className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-12 py-6 text-xl font-bold rounded-full transition-all duration-300 hover:scale-110 shadow-2xl overflow-hidden"
              >
                <span className="relative z-10">Schedule Consultation</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <svg
                  className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300 relative z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="group border-2 border-white/30 text-blue-500 hover:bg-white/10 hover:border-white/50 px-12 py-6 text-xl font-bold rounded-full transition-all duration-300 hover:scale-105 backdrop-blur-sm"
              asChild
            >
              <Link href="/contact">
                Contact Us
                <svg
                  className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
