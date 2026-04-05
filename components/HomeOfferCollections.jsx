'use client'

import React from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import { getCategoryMeta } from "@/lib/marketplaceCategories";

const categoryPriority = (product) => {
  if (product.isFlashDeal || product.promotionType === "flash_deal") return 0;
  if (product.promotionType === "featured") return 1;
  if (product.promotionType === "discount") return 2;
  return 3;
};

const sortProductsForCollections = (products) =>
  [...products].sort((a, b) => {
    const promotionDiff = categoryPriority(a) - categoryPriority(b);
    if (promotionDiff !== 0) {
      return promotionDiff;
    }

    return (b.date || 0) - (a.date || 0);
  });

const formatCategoryHighlights = (products) => {
  const uniqueCategories = [...new Set(products.map((product) => product.category).filter(Boolean))];
  return uniqueCategories.slice(0, 3).map((category) => getCategoryMeta(category).label);
};

const HomeOfferCollections = () => {
  const { products, loadingProducts, formatCurrency, navigate, prefetchRoute } = useAppContext();

  if (loadingProducts) {
    return (
      <div className="mt-16 space-y-6" aria-hidden="true">
        <div className="h-8 w-64 animate-pulse rounded-full bg-gray-100" />
        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-[280px] animate-pulse rounded-[2rem] bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (!products.length) {
    return null;
  }

  const sortedProducts = sortProductsForCollections(products);

  const sellerCards = Object.entries(
    sortedProducts.reduce((acc, product) => {
      if (!product.userId) {
        return acc;
      }

      if (!acc[product.userId]) {
        acc[product.userId] = [];
      }

      acc[product.userId].push(product);
      return acc;
    }, {})
  )
    .map(([sellerId, sellerProducts]) => {
      const sortedSellerProducts = sortProductsForCollections(sellerProducts);
      const primaryProduct = sortedSellerProducts[0];
      const sellerName = primaryProduct?.sellerLocation || primaryProduct?.location || "Marketplace seller";
      const sellerCategories = formatCategoryHighlights(sortedSellerProducts);
      const bestOffer = Math.min(...sortedSellerProducts.map((product) => Number(product.offerPrice) || 0));

      return {
        key: sellerId,
        title: sellerName,
        productCount: sortedSellerProducts.length,
        heroProduct: sortedSellerProducts[0],
        products: sortedSellerProducts.slice(0, 3),
        description: sellerCategories.length
          ? `Offers across ${sellerCategories.join(", ")}`
          : "Explore this seller's latest offers.",
        badge: `${sortedSellerProducts.length} product${sortedSellerProducts.length === 1 ? "" : "s"}`,
        href: `/all-products?seller=${encodeURIComponent(sellerId)}`,
        footer: `Best price ${formatCurrency(bestOffer)}`,
      };
    })
    .sort((a, b) => b.productCount - a.productCount)
    .slice(0, 2);

  if (!sellerCards.length) {
    return null;
  }

  return (
    <section className="mt-16">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-3xl font-semibold text-gray-900">Store offers</p>
          <p className="max-w-2xl text-sm text-gray-500">
            Cleaner store highlights with quick access to shops carrying several products.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {sellerCards.map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() => navigate(card.href)}
            onMouseEnter={() => prefetchRoute(card.href)}
            onFocus={() => prefetchRoute(card.href)}
            className="group overflow-hidden rounded-[2rem] border border-gray-200 bg-white text-left transition hover:border-orange-300 hover:shadow-lg"
          >
            <div className="grid gap-0 sm:grid-cols-[220px_1fr]">
              <div className="relative min-h-[220px] bg-[#f4f2ed]">
                <Image
                  src={card.heroProduct.image[0]}
                  alt={card.heroProduct.name}
                  width={520}
                  height={620}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex rounded-full bg-[#f6f3ee] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                      {card.badge}
                    </span>
                    <p className="mt-4 text-2xl font-semibold text-gray-900">{card.title}</p>
                    <p className="mt-2 text-sm leading-6 text-gray-600">{card.description}</p>
                  </div>
                  <span className="text-sm font-semibold text-orange-700">{card.footer}</span>
                </div>

                <div className="mt-6 space-y-3">
                  {card.products.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-[#fbfaf8] px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                          {getCategoryMeta(product.category).label}
                        </p>
                        <p className="mt-1 truncate text-sm font-semibold text-gray-900">
                          {product.name}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-gray-900">
                        {formatCurrency(product.offerPrice)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-900">
                  Open store offers
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default HomeOfferCollections;
