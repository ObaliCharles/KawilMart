'use client'

import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { defaultSiteContent } from "@/lib/defaultSiteContent";
import { useAppContext } from "@/context/AppContext";

const Banner = ({ banner = defaultSiteContent.promoBanner }) => {
  const { navigate, prefetchRoute } = useAppContext();
  const ctaHref = banner.productId ? `/product/${banner.productId}` : (banner.href || "/all-products");

  return (
    <div className="grid md:grid-cols-[1.1fr_0.9fr] items-center gap-8 bg-[#E6E9F2] my-16 rounded-[2rem] overflow-hidden px-6 md:px-12 py-10">
      <div className="space-y-4">
        <span className="inline-flex bg-white text-orange-600 text-xs font-semibold px-3 py-1 rounded-full">
          Featured banner
        </span>
        <h2 className="text-3xl md:text-4xl font-semibold max-w-[420px] leading-tight">
          {banner.title}
        </h2>
        <p className="max-w-[460px] font-medium text-gray-800/70 leading-7">
          {banner.description}
        </p>
        <button
          onClick={() => navigate(ctaHref)}
          onMouseEnter={() => prefetchRoute(ctaHref)}
          onFocus={() => prefetchRoute(ctaHref)}
          className="group inline-flex items-center justify-center gap-2 px-8 py-3 bg-orange-600 rounded-full text-white"
        >
          {banner.buttonText || "Buy now"}
          <Image className="group-hover:translate-x-1 transition" src={assets.arrow_icon_white} alt="arrow_icon_white" />
        </button>
      </div>

      <div className="relative flex items-center justify-center min-h-[260px]">
        <div className="absolute inset-4 rounded-full bg-white/50 blur-3xl" />
        <Image
          className="relative max-h-72 w-auto object-contain"
          src={banner.imageUrl || assets.jbl_soundbox_image}
          alt={banner.title || "Promotional banner"}
          width={420}
          height={420}
        />
      </div>
    </div>
  );
};

export default Banner;
