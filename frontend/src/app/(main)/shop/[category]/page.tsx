import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductCategoryBySlug, getProducts } from "@/lib/api";
import type { ProductApi } from "@/types/shop";

export const revalidate = 60;

interface Props {
  params: Promise<{ category: string }>;
}

export default async function ShopCategoryPage({ params }: Props) {
  const { category: slug } = await params;
  
  const [category, products] = await Promise.all([
    getProductCategoryBySlug(slug).catch(() => null),
    getProducts({ category: slug }).catch(() => [] as ProductApi[]),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-white/50 mb-8 animate-in fade-in duration-500">
          <Link href="/shop" className="hover:text-white transition">
            Boutique
          </Link>
          <span>/</span>
          <span className="text-white">{category.name}</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-6xl mb-4">{category.icon || "🛍️"}</div>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-white/60 max-w-xl mx-auto">
              {category.description}
            </p>
          )}
          <p className="text-white/40 text-sm mt-4">
            {products.length} produit{products.length > 1 ? "s" : ""} disponible{products.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Produits */}
        {products.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-4xl mb-4">📦</p>
            <p className="text-white/60">Aucun produit dans cette catégorie pour le moment.</p>
            <Link
              href="/shop"
              className="inline-block mt-4 px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-medium transition"
            >
              Voir toute la boutique
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, index }: { product: ProductApi; index: number }) {
  const hasDiscount = product.compare_price && parseFloat(product.compare_price) > parseFloat(product.price);
  
  return (
    <Link
      href={`/shop/produit/${product.slug}`}
      className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-purple-500/40 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Image */}
      <div className="aspect-square relative bg-black/20 overflow-hidden">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl text-white/20">
            🛍️
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.is_featured && (
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-500 text-white">
              Sélection
            </span>
          )}
          {hasDiscount && (
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
              Promo
            </span>
          )}
          {!product.in_stock && (
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-500 text-white">
              Épuisé
            </span>
          )}
        </div>
      </div>

      {/* Infos */}
      <div className="p-4">
        <h3 className="text-white font-semibold group-hover:text-purple-400 transition-colors line-clamp-2">
          {product.name}
        </h3>
        {product.short_description && (
          <p className="text-white/50 text-sm mt-1 line-clamp-2">{product.short_description}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold text-white">{product.price}€</span>
          {hasDiscount && (
            <span className="text-sm text-white/40 line-through">{product.compare_price}€</span>
          )}
        </div>
        {product.sizes.length > 0 && (
          <p className="text-white/40 text-xs mt-2">
            Tailles: {product.sizes.join(", ")}
          </p>
        )}
      </div>
    </Link>
  );
}
