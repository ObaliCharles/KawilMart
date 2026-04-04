import { assets } from "@/assets/assets";

export const defaultSiteContent = {
    heroSlides: [
        {
            _id: "default-hero-1",
            title: "Experience Pure Sound - Your Perfect Headphones Await!",
            offer: "Limited Time Offer 30% Off",
            imageUrl: assets.header_headphone_image.src,
            primaryButtonText: "Shop Now",
            secondaryButtonText: "Explore Deals",
            productId: "",
            primaryHref: "/all-products?category=Headphone",
            secondaryHref: "/all-products?filter=flash",
        },
        {
            _id: "default-hero-2",
            title: "Next-Level Gaming Starts Here - Discover PlayStation 5 Today!",
            offer: "Hurry up, only a few left!",
            imageUrl: assets.header_playstation_image.src,
            primaryButtonText: "Shop Now",
            secondaryButtonText: "Explore Deals",
            productId: "",
            primaryHref: "/all-products?category=Accessories",
            secondaryHref: "/all-products?filter=flash",
        },
        {
            _id: "default-hero-3",
            title: "Power Meets Elegance - Apple MacBook Pro is Ready for Work and Play",
            offer: "Exclusive Deal 40% Off",
            imageUrl: assets.header_macbook_image.src,
            primaryButtonText: "Shop Now",
            secondaryButtonText: "Explore Deals",
            productId: "",
            primaryHref: "/all-products?category=Laptop",
            secondaryHref: "/all-products?filter=flash",
        },
    ],
    featuredCards: [
        {
            _id: "default-feature-1",
            imageUrl: assets.girl_with_headphone_image.src,
            title: "Unparalleled Sound",
            description: "Experience crystal-clear audio with premium headphones.",
            buttonText: "Buy now",
            productId: "",
            href: "/all-products?category=Headphone",
        },
        {
            _id: "default-feature-2",
            imageUrl: assets.girl_with_earphone_image.src,
            title: "Stay Connected",
            description: "Compact and stylish earphones for every occasion.",
            buttonText: "Buy now",
            productId: "",
            href: "/all-products?category=Earphone",
        },
        {
            _id: "default-feature-3",
            imageUrl: assets.boy_with_laptop_image.src,
            title: "Power in Every Pixel",
            description: "Shop the latest laptops for work, gaming, and more.",
            buttonText: "Buy now",
            productId: "",
            href: "/all-products?category=Laptop",
        },
    ],
    promoBanner: {
        title: "Level Up Your Gaming Experience",
        description: "From immersive sound to precise controls, everything you need to win.",
        imageUrl: assets.jbl_soundbox_image.src,
        buttonText: "Buy now",
        productId: "",
        href: "/all-products?category=Accessories",
    },
    newsletter: {
        title: "Subscribe now & get 20% off",
        description: "Join our newsletter and be the first to know about new arrivals, special discounts, and exclusive deals from KawilMart!",
        buttonText: "Subscribe",
    },
    aboutPage: {
        eyebrow: "About KawilMart",
        title: "Northern Uganda's trusted online marketplace for electronics and everyday upgrades.",
        intro: "KawilMart was built to make quality gadgets and essentials easier to discover, compare, and buy from anywhere. We focus on products people actually use every day, backed by reliable local sellers and a smoother online shopping experience.",
        story: "We started with a simple belief: online shopping in our region should feel fast, trustworthy, and personal. That means curated products, transparent pricing, responsive support, and a storefront that helps customers move from discovery to checkout without friction.",
        mission: [
            "Make technology and quality essentials more accessible in Northern Uganda.",
            "Give local sellers better tools to showcase and grow their businesses.",
            "Create a shopping experience that feels modern, reliable, and easy to trust.",
        ],
        stats: [
            { label: "Fast product discovery", value: "Smart filters" },
            { label: "Local-first marketplace", value: "Trusted sellers" },
            { label: "Built for growth", value: "Admin + seller tools" },
        ],
    },
};

export const resolveSiteContent = (content) => {
    if (!content) {
        return defaultSiteContent;
    }

    return {
        heroSlides: Array.isArray(content.heroSlides) ? content.heroSlides : defaultSiteContent.heroSlides,
        featuredCards: Array.isArray(content.featuredCards) ? content.featuredCards : defaultSiteContent.featuredCards,
        promoBanner: content.promoBanner
            ? { ...defaultSiteContent.promoBanner, ...content.promoBanner }
            : defaultSiteContent.promoBanner,
        newsletter: content.newsletter
            ? { ...defaultSiteContent.newsletter, ...content.newsletter }
            : defaultSiteContent.newsletter,
        aboutPage: defaultSiteContent.aboutPage,
    };
};
