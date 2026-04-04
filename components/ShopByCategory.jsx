'use client'
import Link from "next/link";
import React from "react";
import { useAppContext } from "@/context/AppContext";

const categories = [
  { name: "Electronics", icon: "💻", href: "/all-products?category=Laptop" },
  { name: "Phones", icon: "📱", href: "/all-products?category=Smartphone" },
  { name: "Audio", icon: "🎧", href: "/all-products?category=Headphone" },
  { name: "Earphones", icon: "🎵", href: "/all-products?category=Earphone" },
  { name: "Watches", icon: "⌚", href: "/all-products?category=Watch" },
  { name: "Cameras", icon: "📷", href: "/all-products?category=Camera" },
  { name: "Gaming", icon: "🎮", href: "/all-products?search=PlayStation" },
  { name: "Accessories", icon: "🔌", href: "/all-products?category=Accessories" },
];

const ShopByCategory = () => {
  const { setIsRouteLoading } = useAppContext();

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <p className="text-2xl font-bold text-gray-900">Shop by Category</p>
        <Link
          href="/all-products"
          onClick={() => setIsRouteLoading(true)}
          className="text-orange-600 text-sm font-medium hover:underline"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            href={cat.href}
            onClick={() => setIsRouteLoading(true)}
            className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-xl hover:border-orange-400 hover:bg-orange-50 hover:shadow-md transition-all duration-200 group"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
            <span className="text-xs font-medium text-gray-600 group-hover:text-orange-600 text-center leading-tight">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ShopByCategory;
