"use client";

/**
 * Layout Festival — pages éditoriales (Planning/Navettes, Accès/Venue).
 * Même esprit que Identité COF, mais dédié au festival.
 */
export default function FestivalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen px-4 md:px-8 py-16 text-white">
      <div className="max-w-4xl mx-auto">{children}</div>
    </div>
  );
}

