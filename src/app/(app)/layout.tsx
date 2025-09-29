import Chatbot from "@/components/chatbot";
import { Providers } from "@/components/providers/session-provider";
import { StructuredData } from "@/components/structured-data";
import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/client";
import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import "./globals.css";

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Visual EmotionWork - Professional Event Management & Concert Production Cambodia",
    template: "%s | Visual EmotionWork",
  },
  description:
    "Leading event management and concert production company in Cambodia since 2013. Specializing in concert design, event construction, professional sound & lighting systems, LED screens, and stage construction. Transform your vision into unforgettable experiences.",
  keywords: [
    "event management Cambodia",
    "concert production Cambodia",
    "stage design Cambodia",
    "sound system rental Cambodia",
    "lighting system Cambodia",
    "LED screen rental Cambodia",
    "event construction Cambodia",
    "professional audio visual Cambodia",
    "concert stage design",
    "corporate event management",
  ],
  authors: [{ name: "Visual EmotionWork" }],
  creator: "Visual EmotionWork",
  publisher: "Visual EmotionWork",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://visualemotionwork.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Visual EmotionWork - Professional Event Management Cambodia",
    description:
      "Leading event management and concert production company in Cambodia since 2013. Professional sound, lighting, LED screens, and stage construction services.",
    url: "https://visualemotionwork.com",
    siteName: "Visual EmotionWork",
    images: [
      {
        url: "/logo_3.png",
        width: 1200,
        height: 630,
        alt: "Visual EmotionWork - Professional Event Management Cambodia",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Visual EmotionWork - Professional Event Management Cambodia",
    description:
      "Leading event management and concert production company in Cambodia since 2013. Professional sound, lighting, LED screens, and stage construction services.",
    images: ["/logo_3.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <StructuredData />
      </head>
      <body className={`${sourceSans3.className} antialiased`}>
        <Providers>
          <TRPCReactProvider>
            {children}
            <Toaster />
            <Chatbot />
          </TRPCReactProvider>
        </Providers>
      </body>
    </html>
  );
}
