'use client'

import React from "react";
import Image from "next/image";
import ProductCard from "./ProductCard";
import { useAppContext } from "@/context/AppContext";
import { ProductsGridSkeleton } from "@/components/PageSkeletons";
import {
  buildCategoryHref,
  categoryMatchesSelection,
  getCategoryMeta,
  getCategoryMonogram,
  homeCategoryValues,
  homeOfferCollectionValues,
} from "@/lib/marketplaceCategories";

const PRODUCT_BATCH_SIZE = 10;
const HOME_PRODUCT_LIMIT = 30;

const CategoryEditorialPanel = ({ section, quickCategories, reverse, navigate, prefetchRoute, formatCurrency }) => {
  const panelHref = buildCategoryHref(section.value);

  return (
    <div className="col-span-full overflow-hidden rounded-[2rem] border border-gray-200 bg-[#faf8f4]">
      <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        <div className={`flex flex-col justify-between border-b border-gray-200 p-6 lg:border-b-0 ${reverse ? "lg:order-2 lg:border-l lg:border-r-0" : "lg:border-r"}`}>
          <div>
            <span className="inline-flex items-center gap-3 rounded-full bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 shadow-sm">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f3eee6] text-[11px] text-gray-800">
                {section.monogram}
              </span>
              Category edit
            </span>
            <h3 className="mt-5 text-3xl font-semibold tracking-tight text-gray-900">
              {section.label}
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-gray-600">
              {section.description}
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">Live offers</p>
                <p className="mt-2 text-lg font-semibold text-gray-900">{section.productCount}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">From</p>
                <p className="mt-2 text-lg font-semibold text-gray-900">{formatCurrency(section.lowestOffer)}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">Top match</p>
                <p className="mt-2 truncate text-lg font-semibold text-gray-900">{section.leadProduct.name}</p>
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Browse more categories
              </p>
              <div className="flex flex-wrap gap-2">
                {quickCategories.map((category) => {
                  const href = buildCategoryHref(category.value);

                  return (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => navigate(href)}
                      onMouseEnter={() => prefetchRoute(href)}
                      onFocus={() => prefetchRoute(href)}
                      className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                    >
                      {category.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className={`p-5 sm:p-6 ${reverse ? "lg:order-1" : ""}`}>
          <div className="grid gap-3">
            {section.products.map((product, index) => {
              const productHref = `/product/${product._id}`;

              return (
                <button
                  key={product._id}
                  type="button"
                  onClick={() => navigate(productHref)}
                  onMouseEnter={() => prefetchRoute(productHref)}
                  onFocus={() => prefetchRoute(productHref)}
                  className={`grid items-center gap-4 rounded-[1.6rem] border border-gray-200 bg-white p-3 text-left transition hover:border-orange-300 hover:shadow-sm ${index === 0 ? "sm:grid-cols-[132px_1fr]" : "sm:grid-cols-[92px_1fr]"}`}
                >
                  <div className={`overflow-hidden rounded-[1.2rem] bg-[#f5f5f3] ${index === 0 ? "h-32" : "h-24"}`}>
                    <Image
                      src={product.image[0]}
                      alt={product.name}
                      width={260}
                      height={260}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                      {getCategoryMeta(product.category).label}
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-gray-900">
                      {product.name}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      {product.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-orange-700">
                        {formatCurrency(product.offerPrice)}
                      </span>
                      <span className="text-xs font-medium text-gray-500">View item →</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={() => navigate(panelHref)}
              onMouseEnter={() => prefetchRoute(panelHref)}
              onFocus={() => prefetchRoute(panelHref)}
              className="inline-flex items-center gap-2 rounded-full border border-gray-900 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-900 hover:text-white"
            >
              Explore {section.label}
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const HomeProducts = () => {

  const { products, loadingProducts, navigate, prefetchRoute, formatCurrency } = useAppContext()

  const promotionPriority = (product) => {
    if (product.isFlashDeal || product.promotionType === "flash_deal") return 0
    if (product.promotionType === "featured") return 1
    if (product.promotionType === "discount") return 2
    return 3
  }

  const featuredProducts = [...products]
    .sort((a, b) => {
      const promotionDiff = promotionPriority(a) - promotionPriority(b)
      if (promotionDiff !== 0) {
        return promotionDiff
      }

      return (b.date || 0) - (a.date || 0)
    })
    .slice(0, HOME_PRODUCT_LIMIT)

  const categorySections = homeOfferCollectionValues
    .map((categoryValue) => {
      const categoryProducts = featuredProducts.filter((product) =>
        categoryMatchesSelection(product.category, categoryValue)
      )

      if (categoryProducts.length < 2) {
        return null
      }

      const meta = getCategoryMeta(categoryValue)

      return {
        value: categoryValue,
        label: meta.label,
        description: meta.description,
        monogram: getCategoryMonogram(categoryValue),
        leadProduct: categoryProducts[0],
        products: categoryProducts.slice(0, 4),
        lowestOffer: Math.min(...categoryProducts.map((product) => Number(product.offerPrice) || 0)),
        productCount: categoryProducts.length,
      }
    })
    .filter(Boolean)

  const panelCount = Math.max(0, Math.min(categorySections.length, Math.floor((featuredProducts.length - 1) / PRODUCT_BATCH_SIZE)))

  if (loadingProducts) {
    return <ProductsGridSkeleton />
  }

  return (
    <div className="flex flex-col items-center pt-14">
      <div className="w-full">
        <p className="text-2xl font-semibold text-gray-900">Popular products</p>
        <p className="mt-1 text-sm text-gray-500">
          A cleaner homepage feed with category edits inserted between product batches.
        </p>
      </div>

      <div className="mt-6 grid w-full grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: Math.ceil(featuredProducts.length / PRODUCT_BATCH_SIZE) }).map((_, chunkIndex) => {
          const start = chunkIndex * PRODUCT_BATCH_SIZE
          const chunkProducts = featuredProducts.slice(start, start + PRODUCT_BATCH_SIZE)
          const section = chunkIndex < panelCount ? categorySections[chunkIndex] : null
          const quickCategories = homeCategoryValues
            .slice((chunkIndex * 4) % homeCategoryValues.length)
            .concat(homeCategoryValues.slice(0, (chunkIndex * 4) % homeCategoryValues.length))
            .slice(0, 6)
            .map((categoryValue) => ({
              value: categoryValue,
              label: getCategoryMeta(categoryValue).label,
            }))

          return (
            <React.Fragment key={`chunk-${chunkIndex}`}>
              {chunkProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}

              {section ? (
                <CategoryEditorialPanel
                  section={section}
                  quickCategories={quickCategories}
                  reverse={chunkIndex % 2 === 1}
                  navigate={navigate}
                  prefetchRoute={prefetchRoute}
                  formatCurrency={formatCurrency}
                />
              ) : null}
            </React.Fragment>
          )
        })}
      </div>

      <button
        onClick={() => navigate("/all-products")}
        className="mt-10 rounded-full border border-gray-300 px-12 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-900 hover:bg-gray-900 hover:text-white"
      >
        See more
      </button>
    </div>
  );
};

export default HomeProducts;
