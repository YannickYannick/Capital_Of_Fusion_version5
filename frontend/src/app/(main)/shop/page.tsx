import Link from "next/link";
import { getProductCategories, getProducts } from "@/lib/api";
import type { ProductCategoryApi, ProductApi } from "@/types/shop";

export const revalidate = 60;

export default async function ShopPage() {
  const [categories, featuredProducts] = await Promise.all([
    getProductCategories().catch(() => [] as ProductCategoryApi[]),
    getProducts({ featured: true }).catch(() => [] as ProductApi[]),
  ]);

  const allProducts = await getProducts().catch(() => [] as ProductApi[]);

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Capital of Fusion
          </p>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            Boutique &{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Merch
            </span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Vêtements, accessoires et produits exclusifs Capital of Fusion.
          </p>
        </div>

        {/* Catégories */}
        {categories.length > 0 && (
          <section className="mb-16">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">📦</span> Catégories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((cat, i) => (
                <Link
                  key={cat.id}
                  href={`/shop/${cat.slug}`}
                  className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/40 hover:bg-white/10 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="text-4xl mb-3">{cat.icon || "🛍️"}</div>
                  <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-white/50 text-sm mt-1">
                    {cat.products_count} produit{cat.products_count > 1 ? "s" : ""}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Produits mis en avant */}
        {featuredProducts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">⭐</span> Sélection du moment
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.slice(0, 6).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Tous les produits */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">🛒</span> Tous les produits
          </h2>
          {allProducts.length === 0 ? (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-4xl mb-4">🛍️</p>
              <p className="text-white/60">La boutique sera bientôt disponible.</p>
              <p className="text-white/40 text-sm mt-2">
                Revenez prochainement pour découvrir nos produits exclusifs !
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {allProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </section>
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
        <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
          {product.category_name}
        </p>
        <h3 className="text-white font-semibold group-hover:text-purple-400 transition-colors line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold text-white">{product.price}€</span>
          {hasDiscount && (
            <span className="text-sm text-white/40 line-through">{product.compare_price}€</span>
          )}
        </div>
      </div>
    </Link>
  );
}
