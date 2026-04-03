'use client'
import React, { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { assets } from "@/assets/assets";

const FlashDeals = () => {
  const { products, currency, router } = useAppContext();
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 32, seconds: 58 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) return { hours, minutes, seconds: seconds - 1 };
        if (minutes > 0) return { hours, minutes: minutes - 1, seconds: 59 };
        if (hours > 0) return { hours: hours - 1, minutes: 59, seconds: 59 };
        return { hours: 5, minutes: 32, seconds: 58 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');

  // Get actual flash deal products
  const flashDeals = products.filter(p => p.isFlashDeal && (!p.flashDealEndDate || new Date(p.flashDealEndDate) > new Date())).slice(0, 6);

  if (flashDeals.length === 0) return null;

  return (
    <div className="mt-14">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <p className="text-2xl font-bold text-gray-900">Flash Deals</p>
          </div>
          {/* Countdown */}
          <div className="flex items-center gap-1 bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold">
            <span>Ends in:</span>
            <span className="bg-white text-orange-600 px-1.5 py-0.5 rounded">{pad(timeLeft.hours)}</span>
            <span>:</span>
            <span className="bg-white text-orange-600 px-1.5 py-0.5 rounded">{pad(timeLeft.minutes)}</span>
            <span>:</span>
            <span className="bg-white text-orange-600 px-1.5 py-0.5 rounded">{pad(timeLeft.seconds)}</span>
          </div>
        </div>
        <button
          onClick={() => router.push('/all-products?filter=flash')}
          className="text-orange-600 text-sm font-medium hover:underline flex items-center gap-1"
        >
          See All <span>→</span>
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {flashDeals.map((product) => {
          const discount = Math.round(((product.price - product.offerPrice) / product.price) * 100);
          return (
            <div
              key={product._id}
              onClick={() => { router.push('/product/' + product._id); scrollTo(0, 0); }}
              className="bg-white border border-gray-100 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
            >
              {/* Image */}
              <div className="relative bg-gray-50 h-40 flex items-center justify-center p-3">
                <span className="absolute top-2 left-2 bg-orange-600 text-white text-xs font-bold px-2 py-0.5 rounded-full z-10">
                  -{discount}%
                </span>
                <Image
                  src={product.image[0]}
                  alt={product.name}
                  width={150}
                  height={150}
                  className="h-32 w-auto object-contain group-hover:scale-105 transition"
                />
              </div>
              {/* Info */}
              <div className="p-3">
                <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-orange-600 font-bold text-sm">{currency}{product.offerPrice.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 line-through">{currency}{product.price.toLocaleString()}</p>
                </div>
                {/* Progress bar */}
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                      style={{ width: `${Math.min(90, 30 + discount)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">🔥 {Math.min(90, 30 + discount)}% claimed</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FlashDeals;
