'use client'

import React, { useState, useEffect } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { defaultSiteContent } from "@/lib/defaultSiteContent";
import { useAppContext } from "@/context/AppContext";

const HeaderSlider = ({ slides = defaultSiteContent.heroSlides }) => {
  const { navigate, prefetchRoute } = useAppContext();
  const sliderData = Array.isArray(slides) ? slides : defaultSiteContent.heroSlides;

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (sliderData.length <= 1) {
      return undefined;
    }

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [sliderData.length]);

  useEffect(() => {
    setCurrentSlide(0);
  }, [sliderData.length]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  const getPrimaryHref = (slide) => {
    if (slide.productId) {
      return `/product/${slide.productId}`;
    }

    return slide.primaryHref || "/all-products";
  };

  const getSecondaryHref = (slide) => slide.secondaryHref || "/all-products?filter=flash";

  if (!sliderData.length) {
    return null;
  }

  return (
    <div className="overflow-hidden relative w-full">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}
      >
        {sliderData.map((slide, index) => {
          const primaryHref = getPrimaryHref(slide);
          const secondaryHref = getSecondaryHref(slide);

          return (
          <div
            key={slide._id || slide.id || index}
            className="flex flex-col-reverse md:flex-row items-center justify-between bg-[#E6E9F2] py-8 md:px-14 px-5 mt-6 rounded-xl min-w-full"
          >
            <div className="md:pl-8 mt-10 md:mt-0">
              <p className="md:text-base text-orange-600 pb-1">{slide.offer}</p>
              <h1 className="max-w-lg md:text-[40px] md:leading-[48px] text-2xl font-semibold">
                {slide.title}
              </h1>
              <div className="flex items-center mt-4 md:mt-6 ">
                <button
                  onClick={() => navigate(primaryHref)}
                  onMouseEnter={() => prefetchRoute(primaryHref)}
                  onFocus={() => prefetchRoute(primaryHref)}
                  className="md:px-10 px-7 md:py-2.5 py-2 bg-orange-600 rounded-full text-white font-medium"
                >
                  {slide.primaryButtonText || "Shop Now"}
                </button>
                <button
                  onClick={() => navigate(secondaryHref)}
                  onMouseEnter={() => prefetchRoute(secondaryHref)}
                  onFocus={() => prefetchRoute(secondaryHref)}
                  className="group flex items-center gap-2 px-6 py-2.5 font-medium"
                >
                  {slide.secondaryButtonText || "Explore Deals"}
                  <Image className="group-hover:translate-x-1 transition" src={assets.arrow_icon} alt="arrow_icon" />
                </button>
              </div>
            </div>
            <div className="flex items-center flex-1 justify-center">
              <Image
                className="md:w-72 w-48"
                src={slide.imageUrl}
                alt={`Slide ${index + 1}`}
                width={420}
                height={420}
              />
            </div>
          </div>
        )})}
      </div>

      <div className="flex items-center justify-center gap-2 mt-8">
        {sliderData.map((_, index) => (
          <div
            key={index}
            onClick={() => handleSlideChange(index)}
            className={`h-2 w-2 rounded-full cursor-pointer ${
              currentSlide === index ? "bg-orange-600" : "bg-gray-500/30"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default HeaderSlider;
