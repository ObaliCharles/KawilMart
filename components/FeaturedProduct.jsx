'use client'

import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { defaultSiteContent } from "@/lib/defaultSiteContent";
import { useAppContext } from "@/context/AppContext";

const FeaturedProduct = ({ cards = defaultSiteContent.featuredCards }) => {
  const { navigate, prefetchRoute } = useAppContext();
  const featuredCards = Array.isArray(cards) ? cards : defaultSiteContent.featuredCards;

  if (!featuredCards.length) {
    return null;
  }

  return (
    <div className="mt-14">
      <div className="flex flex-col items-center">
        <p className="text-3xl font-medium">Featured Products</p>
        <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-14 mt-12 md:px-14 px-4">
        {featuredCards.map((card, index) => {
          const ctaHref = card.productId ? `/product/${card.productId}` : (card.href || "/all-products");

          return (
          <div key={card._id || index} className="relative group">
            <Image
              src={card.imageUrl}
              alt={card.title}
              className="group-hover:brightness-75 transition duration-300 w-full h-auto object-cover"
              width={720}
              height={900}
            />
            <div className="group-hover:-translate-y-4 transition duration-300 absolute bottom-8 left-8 text-white space-y-2">
              <p className="font-medium text-xl lg:text-2xl">{card.title}</p>
              <p className="text-sm lg:text-base leading-5 max-w-60">
                {card.description}
              </p>
              <button
                onClick={() => navigate(ctaHref)}
                onMouseEnter={() => prefetchRoute(ctaHref)}
                onFocus={() => prefetchRoute(ctaHref)}
                className="flex items-center gap-1.5 bg-orange-600 px-4 py-2 rounded"
              >
                {card.buttonText || "Buy now"} <Image className="h-3 w-3" src={assets.redirect_icon} alt="Redirect Icon" />
              </button>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
};

export default FeaturedProduct;
