"use client";

import Link from "next/link";
import { Bus, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/bookings", label: "My Bookings" },
  { href: "/about", label: "About" },
];

const POPULAR_ROUTES = [
  { href: "/search?from=Hyderabad&to=Vijayawada", label: "Hyderabad - Vijayawada" },
  { href: "/search?from=Hyderabad&to=Visakhapatnam", label: "Hyderabad - Vizag" },
  { href: "/search?from=Hyderabad&to=Tirupati", label: "Hyderabad - Tirupati" },
  { href: "/search?from=Vijayawada&to=Visakhapatnam", label: "Vijayawada - Vizag" },
];

const SOCIAL = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Bus className="w-8 h-8 text-red-500" />
              <span className="text-xl font-bold text-white">BusGo</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              Your trusted partner for bus travel across Telangana and Andhra
              Pradesh. Book tickets easily and travel comfortably.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Routes */}
          <div>
            <h3 className="text-white font-semibold mb-4">Popular Routes</h3>
            <ul className="space-y-2">
              {POPULAR_ROUTES.map((route) => (
                <li key={route.href}>
                  <Link
                    href={route.href}
                    className="hover:text-white transition-colors"
                  >
                    {route.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <p className="text-sm mb-2">support@busgo.com</p>
            <p className="text-sm mb-4">+91 1800 123 4567</p>
            <div className="flex gap-3">
              {SOCIAL.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className={cn(
                    "w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center",
                    "hover:bg-red-600 hover:text-white transition-colors"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} BusGo. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
