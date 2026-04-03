'use client'
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const categories = [
  "All", "Earphone", "Headphone", "Watch", "Smartphone", "Laptop", "Camera", "Accessories",
];

const priceRanges = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under UGX 50,000", min: 0, max: 50000 },
  { label: "UGX 50K – 150K", min: 50000, max: 150000 },
  { label: "UGX 150K – 500K", min: 150000, max: 500000 },
  { label: "UGX 500K – 1M", min: 500000, max: 1000000 },
  { label: "Above UGX 1M", min: 1000000, max: Infinity },
];

const sortOptions = [
  { label: "Default", value: "default" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest First", value: "newest" },
  { label: "Best Discount", value: "discount" },
];

function AllProductsInner() {
  const { products, loadingProducts } = useAppContext();
  const searchParams = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [sortBy, setSortBy] = useState("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
    const filter = searchParams.get("filter");
    if (filter === "flash") setSortBy("discount");
  }, [searchParams]);

  const filterAndSort = () => {
    let filtered = [...products];
    if (searchQuery.trim()) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    if (selectedCategory !== "All") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    const range = priceRanges[selectedPriceRange];
    filtered = filtered.filter(p => p.offerPrice >= range.min && p.offerPrice <= range.max);
    if (sortBy === "price_asc") filtered.sort((a, b) => a.offerPrice - b.offerPrice);
    else if (sortBy === "price_desc") filtered.sort((a, b) => b.offerPrice - a.offerPrice);
    else if (sortBy === "newest") filtered.sort((a, b) => b.date - a.date);
    else if (sortBy === "discount") {
      filtered.sort((a, b) => {
        const da = a.price > 0 ? (a.price - a.offerPrice) / a.price : 0;
        const db = b.price > 0 ? (b.price - b.offerPrice) / b.price : 0;
        return db - da;
      });
    }
    return filtered;
  };

  const filteredProducts = filterAndSort();

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <p className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Search</p>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
        />
      </div>
      <div>
        <p className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Category</p>
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                selectedCategory === cat ? "bg-orange-600 text-white font-medium" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Price Range</p>
        <div className="space-y-1">
          {priceRanges.map((range, index) => (
            <button
              key={index}
              onClick={() => setSelectedPriceRange(index)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                selectedPriceRange === index ? "bg-orange-600 text-white font-medium" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={() => { setSelectedCategory("All"); setSelectedPriceRange(0); setSortBy("default"); setSearchQuery(""); }}
        className="w-full py-2 border border-orange-500 text-orange-600 rounded-lg text-sm hover:bg-orange-50 transition"
      >
        Clear All Filters
      </button>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 py-8 min-h-screen bg-gray-50/30">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-2xl font-bold text-gray-900">All Products</p>
            <p className="text-sm text-gray-500 mt-1">{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 bg-white"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              ⚙ Filters
            </button>
          </div>
        </div>

        {/* Active tags */}
        {(selectedCategory !== "All" || selectedPriceRange !== 0 || searchQuery) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedCategory !== "All" && (
              <span className="flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">
                📦 {selectedCategory}
                <button onClick={() => setSelectedCategory("All")} className="ml-1 font-bold hover:text-orange-900">×</button>
              </span>
            )}
            {selectedPriceRange !== 0 && (
              <span className="flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">
                💰 {priceRanges[selectedPriceRange].label}
                <button onClick={() => setSelectedPriceRange(0)} className="ml-1 font-bold hover:text-orange-900">×</button>
              </span>
            )}
            {searchQuery && (
              <span className="flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">
                🔍 &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery("")} className="ml-1 font-bold hover:text-orange-900">×</button>
              </span>
            )}
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <div className="hidden md:block w-56 flex-shrink-0">
            <div className="sticky top-6 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <FilterPanel />
            </div>
          </div>

          {/* Mobile filter drawer */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={() => setShowMobileFilters(false)}>
              <div className="absolute right-0 top-0 bottom-0 w-72 bg-white p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <p className="font-bold text-lg">Filters</p>
                  <button onClick={() => setShowMobileFilters(false)} className="text-2xl text-gray-400">×</button>
                </div>
                <FilterPanel />
              </div>
            </div>
          )}

          {/* Products */}
          <div className="flex-1">
            {loadingProducts ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-orange-300 border-gray-200 mb-4"></div>
                <p className="text-gray-600 text-lg">Refreshing products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <span className="text-5xl mb-4">🔍</span>
                <p className="text-lg font-medium">No products found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-14">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={index} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

const AllProducts = () => (
  <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
    <AllProductsInner />
  </Suspense>
);

export default AllProducts;
