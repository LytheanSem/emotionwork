"use client";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChevronDown } from "lucide-react";
import { Inter } from "next/font/google";
import Link from "next/link";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

interface NavbarItem {
  href: string;
  children: React.ReactNode;
}

interface Props {
  items: NavbarItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NavbarSidebar = ({ items, open, onOpenChange }: Props) => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const bookingItems = [
    { href: "/book-meeting", children: "Book Meeting" },
    { href: "/manage-booking", children: "Manage Booking" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className={`p-0 transition-none ${inter.className}`}>
        <SheetHeader className="p-4 border-b">
          <div>
            <SheetTitle>
              <span className="text-2xl font-bold">Menu</span>
            </SheetTitle>
          </div>
        </SheetHeader>
        <ScrollArea className="flex flex-col overflow-y-auto h-full pb-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="w-full text-left p-4 hover:bg-primary hover:text-primary-foreground flex items-center text-base font-medium"
              onClick={() => onOpenChange(false)}
            >
              {item.children}
            </Link>
          ))}

          {/* Booking Dropdown */}
          <Collapsible open={isBookingOpen} onOpenChange={setIsBookingOpen}>
            <CollapsibleTrigger className="w-full text-left p-4 hover:bg-primary hover:text-primary-foreground flex items-center justify-between text-base font-medium">
              Bookings
              <ChevronDown className={`h-4 w-4 transition-transform ${isBookingOpen ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              {bookingItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="w-full text-left pl-8 pr-4 py-2 hover:bg-primary hover:text-primary-foreground flex items-center text-sm font-medium"
                  onClick={() => onOpenChange(false)}
                >
                  {item.children}
                </Link>
              ))}
            </CollapsibleContent>
          </Collapsible>

          <div className="border-t mt-4">
            <Link
              href="/sign-in"
              className="w-full text-left p-4 hover:bg-primary hover:text-primary-foreground flex items-center text-base font-medium"
            >
              Sign in
            </Link>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
