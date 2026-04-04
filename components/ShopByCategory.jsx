'use client'
import Link from "next/link";
import React from "react";

const categories = [
  { name: "Electronics", icon: "💻", query: "Laptop" },
  { name: "Phones", icon: "📱", query: "Smartphone" },
  { name: "Audio", icon: "🎧", query: "Headphone" },
  { name: "Earphones", icon: "🎵", query: "Earphone" },
  { name: "Watches", icon: "⌚", query: "Watch" },
  { name: "Cameras", icon: "📷", query: "Camera" },
  { name: "Gaming", icon: "🎮", query: "Gaming" },
  { name: "Accessories", icon: "🔌", query: "Accessories" },
];

const ShopByCategory = () => {
  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <p className="text-2xl font-bold text-gray-900">Shop by Category</p>
        <Link
          href="/all-products"
          className="text-orange-600 text-sm font-medium hover:underline"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            href={`/all-products?category=${cat.query}`}
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
