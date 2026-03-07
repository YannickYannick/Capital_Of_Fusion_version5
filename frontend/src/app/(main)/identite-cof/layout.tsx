/**
 * Layout Identité COF — Notre vision & Bulletins.
 * Aligné sur formations/contenu : pt-64 pb-20, max-w-4xl.
 */
export default function IdentiteCofLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pt-64 pb-20 px-4 md:px-8 text-white">
      <div className="max-w-4xl mx-auto">
        {children}
      </div>
    </div>
  );
}
