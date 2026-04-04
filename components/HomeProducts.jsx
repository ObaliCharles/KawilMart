'use client'

import React from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "@/context/AppContext";
import { ProductsGridSkeleton } from "@/components/PageSkeletons";

const HomeProducts = () => {

  const { products, loadingProducts, navigate } = useAppContext()

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
    .slice(0, 10)

  if (loadingProducts) {
    return <ProductsGridSkeleton />
  }

  return (
    <div className="flex flex-col items-center pt-14">
      <p className="text-2xl font-medium text-left w-full">Popular products</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-col items-center gap-6 mt-6 pb-14 w-full">
        {featuredProducts.map((product) => <ProductCard key={product._id} product={product} />)}
      </div>
      <button
        onClick={() => navigate("/all-products")}
        className="px-12 py-2.5 border rounded text-gray-500/70 hover:bg-slate-50/90 transition"
      >
        See more
      </button>
    </div>
  );
};

export default HomeProducts;
