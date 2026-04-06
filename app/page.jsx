import Banner from "@/components/Banner";
import FeaturedProduct from "@/components/FeaturedProduct";
import FlashDeals from "@/components/FlashDeals";
import Footer from "@/components/Footer";
import HeaderSlider from "@/components/HeaderSlider";
import MarketplacePulse from "@/components/MarketplacePulse";
import HomeOfferCollections from "@/components/HomeOfferCollections";
import HomeProducts from "@/components/HomeProducts";
import Navbar from "@/components/Navbar";
import NewsLetter from "@/components/NewsLetter";
import ShopByCategory from "@/components/ShopByCategory";
import { getResolvedSiteContent } from "@/lib/getSiteContent";

export const dynamic = "force-dynamic";

const Home = async () => {
  const siteContent = await getResolvedSiteContent();

  return (
    <>
      <Navbar />
      <div className="px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24">
        <HeaderSlider slides={siteContent.heroSlides} />
        <MarketplacePulse />
        <ShopByCategory />
        <FlashDeals />
        <HomeProducts />
        <HomeOfferCollections />
        <FeaturedProduct cards={siteContent.featuredCards} />
        <Banner banner={siteContent.promoBanner} />
        <NewsLetter newsletter={siteContent.newsletter} />
      </div>
      <Footer />
    </>
  );
};

export default Home;
