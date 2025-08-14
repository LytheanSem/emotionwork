import { Footer } from "./footer";
import { Navbar } from "./navbar";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-24 pb-24">{children}</main>
      <Footer />
    </div>
  );
}
