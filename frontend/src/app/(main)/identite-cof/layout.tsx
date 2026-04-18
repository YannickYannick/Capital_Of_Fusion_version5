/**
 * Layout Identité COF — même enveloppe que Support (hub + pages éditoriales).
 */
export default function IdentiteCofLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen px-4 md:px-8 py-16 text-white">
      <div className="max-w-4xl mx-auto">{children}</div>
    </div>
  );
}
