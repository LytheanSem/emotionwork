import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const AboutPage = () => {
  return (
    <div className={`${inter.className} min-h-screen bg-white py-24 px-6`}>
      <div className="max-w-6xl mx-auto">
        {/* Page Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-16">
          About
        </h1>

        {/* Section 1: Crafting Immersive Stage Experiences */}
        <section className="bg-gray-50 rounded-lg p-8 md:p-12 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Crafting Immersive Stage Experiences
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed max-w-4xl">
            Founded in 2018 Visual Emotion Work was born out of a passion for blending creative stagecraft with cutting-edge technology. Inspired by a lack of immersive planning tools in the event industry, our founders built a company where artistry meets AI.
          </p>
        </section>

        {/* Section 2: Meet the Creators */}
        <section className="bg-gray-50 rounded-lg p-8 md:p-12 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            Meet the Creators
          </h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12">
            {/* Creator 1 */}
            <div className="text-center">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 md:w-16 md:h-16 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <p className="text-sm text-gray-600">Founder & Creative Director</p>
            </div>

            {/* Creator 2 */}
            <div className="text-center">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 md:w-16 md:h-16 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <p className="text-sm text-gray-600">Technical Lead</p>
            </div>

            {/* Creator 3 */}
            <div className="text-center">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 md:w-16 md:h-16 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <p className="text-sm text-gray-600">Operations Manager</p>
            </div>
          </div>
        </section>

        {/* Section 3: How We Work */}
        <section className="bg-gray-50 rounded-lg p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            How We Work
          </h2>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Step 1: Plan */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Plan</h3>
              <p className="text-gray-600">Collaborate with clients to define vision</p>
            </div>

            {/* Step 2: Design */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Design</h3>
              <p className="text-gray-600">Use AI +30 tools to visualize in real time</p>
            </div>

            {/* Step 3: Deliver */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Deliver</h3>
              <p className="text-gray-600">Execute with precision and emotion</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
