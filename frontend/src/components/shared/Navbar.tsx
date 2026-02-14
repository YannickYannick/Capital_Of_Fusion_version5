"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { MobileNav } from "./MobileNav";

/**
 * Navbar — transparente en haut, bg-black/80 backdrop-blur au scroll.
 * Design system : #0a0e27, purple accents, Inter.
 */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { href: "/", label: "Accueil" },
    { href: "/explore", label: "Explore" },
    { href: "/cours", label: "Cours" },
    { href: "/evenements", label: "Événements" },
    { href: "/boutique", label: "Boutique" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/80 backdrop-blur-md border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent hover:opacity-90 transition"
        >
          [CF] Capital of Fusion
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-white/90 hover:text-white text-sm font-medium transition"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/login"
            className="p-2 text-white/90 hover:text-white transition"
            aria-label="Connexion"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </Link>
        </div>

        <div className="md:hidden">
          <MobileNav />
        </div>
      </nav>
    </header>
  );
}
