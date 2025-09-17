import Chatbot from "@/components/chatbot";
import { Providers } from "@/components/providers/session-provider";
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
  title: "Visual EmotionWork",
  description:
    "Leading event management and concert production company in Cambodia. Specializing in concert design, event construction, and professional event management services. Transform your vision into unforgettable experiences with our expert team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
