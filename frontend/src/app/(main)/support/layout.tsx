"use client";

/**
 * Layout Support — pages éditoriales (FAQ, Nous contacter).
 */
export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen px-4 md:px-8 py-16 text-white">
      <div className="max-w-4xl mx-auto">{children}</div>
    </div>
  );
}

