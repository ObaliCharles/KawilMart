'use client'
import React, { Suspense, lazy } from "react";
import Loading from "@/components/Loading";

// Lazy load components
const HeaderSlider = lazy(() => import("@/components/HeaderSlider"));
const HomeProducts = lazy(() => import("@/components/HomeProducts"));
const Banner = lazy(() => import("@/components/Banner"));
const NewsLetter = lazy(() => import("@/components/NewsLetter"));
const FeaturedProduct = lazy(() => import("@/components/FeaturedProduct"));
const FlashDeals = lazy(() => import("@/components/FlashDeals"));
const ShopByCategory = lazy(() => import("@/components/ShopByCategory"));
const Navbar = lazy(() => import("@/components/Navbar"));
const Footer = lazy(() => import("@/components/Footer"));

const Home = () => {
  return (
    <>
      <Suspense fallback={<Loading message="Loading navigation..." />}>
        <Navbar/>
      </Suspense>
      <div className="px-6 md:px-16 lg:px-32">
        <Suspense fallback={<Loading message="Loading slider..." />}>
          <HeaderSlider />
        </Suspense>
        <Suspense fallback={<Loading message="Loading categories..." />}>
          <ShopByCategory />
        </Suspense>
        <Suspense fallback={<Loading message="Loading deals..." />}>
          <FlashDeals />
        </Suspense>
        <Suspense fallback={<Loading message="Refreshing products..." />}>
          <HomeProducts />
        </Suspense>
        <Suspense fallback={<Loading message="Loading featured..." />}>
          <FeaturedProduct />
        </Suspense>
        <Suspense fallback={<Loading message="Loading banner..." />}>
          <Banner />
        </Suspense>
        <Suspense fallback={<Loading message="Loading newsletter..." />}>
          <NewsLetter />
        </Suspense>
      </div>
      <Suspense fallback={<Loading message="Loading footer..." />}>
        <Footer />
      </Suspense>
    </>
  );
};

export default Home;
