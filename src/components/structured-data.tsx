export function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Visual EmotionWork",
    alternateName: "Visual Emotion Work",
    url: "https://visualemotionwork.com",
    logo: "https://visualemotionwork.com/logo_3.png",
    description:
      "Leading event management and concert production company in Cambodia since 2013. Specializing in concert design, event construction, professional sound & lighting systems, LED screens, and stage construction.",
    foundingDate: "2013",
    address: {
      "@type": "PostalAddress",
      streetAddress: "#633, St 75K, S/K Kakap, Khan Posenchey",
      addressLocality: "Phnom Penh",
      addressCountry: "Cambodia",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+855-98-505079",
      contactType: "customer service",
      email: "visualemotion@gmail.com",
    },
    sameAs: ["https://www.facebook.com/VisualEmotionworkCoLtd"],
    areaServed: {
      "@type": "Country",
      name: "Cambodia",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Event Management Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Professional Sound System",
            description:
              "High-quality sound equipment rental for concerts, events, and productions with crystal-clear audio.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Professional Lighting System",
            description:
              "Advanced lighting solutions to create stunning visual experiences that captivate your audience.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "LED Screen & Projector",
            description: "High-resolution LED displays and professional projectors for stunning visual presentations.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Stage & Truss Structure",
            description: "Professional stage construction and truss systems for safe, secure event setups.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "3D Visual & Production Design",
            description: "Creative 3D visual effects and comprehensive production design services.",
          },
        },
      ],
    },
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://visualemotionwork.com/#business",
    name: "Visual EmotionWork",
    image: "https://visualemotionwork.com/logo_3.png",
    description: "Professional event management and concert production company in Cambodia",
    url: "https://visualemotionwork.com",
    telephone: "+855-98-505079",
    email: "visualemotion@gmail.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "#633, St 75K, S/K Kakap, Khan Posenchey",
      addressLocality: "Phnom Penh",
      addressCountry: "Cambodia",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "11.5564",
      longitude: "104.9282",
    },
    openingHours: "Mo-Fr 08:00-18:00",
    priceRange: "$$",
    areaServed: {
      "@type": "Country",
      name: "Cambodia",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
    </>
  );
}
