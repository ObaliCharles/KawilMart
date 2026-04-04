import Banner from "@/components/Banner";
import FeaturedProduct from "@/components/FeaturedProduct";
import FlashDeals from "@/components/FlashDeals";
import Footer from "@/components/Footer";
import HeaderSlider from "@/components/HeaderSlider";
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
      <div className="px-6 md:px-16 lg:px-32">
        <HeaderSlider slides={siteContent.heroSlides} />
        <ShopByCategory />
        <FlashDeals />
        <HomeProducts />
        <FeaturedProduct cards={siteContent.featuredCards} />
        <Banner banner={siteContent.promoBanner} />
        <NewsLetter newsletter={siteContent.newsletter} />
      </div>
      <Footer />
    </>
  );
};

export default Home;
