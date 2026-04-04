import { assets } from "@/assets/assets";

const toPlainString = (value, fallback = "") => {
    if (typeof value === "string") {
        return value;
    }

    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }

    if (value && typeof value === "object" && typeof value.src === "string") {
        return value.src;
    }

    return fallback;
};

const normalizeHeroSlide = (slide, fallbackSlide, index) => ({
    _id: toPlainString(slide?._id, fallbackSlide?._id || `hero-slide-${index + 1}`),
    title: toPlainString(slide?.title, fallbackSlide?.title || ""),
    offer: toPlainString(slide?.offer, fallbackSlide?.offer || ""),
    imageUrl: toPlainString(slide?.imageUrl, fallbackSlide?.imageUrl || ""),
    primaryButtonText: toPlainString(slide?.primaryButtonText, fallbackSlide?.primaryButtonText || "Shop Now"),
    secondaryButtonText: toPlainString(slide?.secondaryButtonText, fallbackSlide?.secondaryButtonText || "Explore Deals"),
    productId: toPlainString(slide?.productId, fallbackSlide?.productId || ""),
    primaryHref: toPlainString(slide?.primaryHref, fallbackSlide?.primaryHref || ""),
    secondaryHref: toPlainString(slide?.secondaryHref, fallbackSlide?.secondaryHref || "/all-products?filter=flash"),
});

const normalizeFeaturedCard = (card, fallbackCard, index) => ({
    _id: toPlainString(card?._id, fallbackCard?._id || `featured-card-${index + 1}`),
    imageUrl: toPlainString(card?.imageUrl, fallbackCard?.imageUrl || ""),
    title: toPlainString(card?.title, fallbackCard?.title || ""),
    description: toPlainString(card?.description, fallbackCard?.description || ""),
    buttonText: toPlainString(card?.buttonText, fallbackCard?.buttonText || "Buy now"),
    productId: toPlainString(card?.productId, fallbackCard?.productId || ""),
    href: toPlainString(card?.href, fallbackCard?.href || ""),
});

const normalizeBanner = (banner, fallbackBanner) => ({
    title: toPlainString(banner?.title, fallbackBanner?.title || ""),
    description: toPlainString(banner?.description, fallbackBanner?.description || ""),
    imageUrl: toPlainString(banner?.imageUrl, fallbackBanner?.imageUrl || ""),
    buttonText: toPlainString(banner?.buttonText, fallbackBanner?.buttonText || "Buy now"),
    productId: toPlainString(banner?.productId, fallbackBanner?.productId || ""),
    href: toPlainString(banner?.href, fallbackBanner?.href || ""),
});

const normalizeNewsletter = (newsletter, fallbackNewsletter) => ({
    title: toPlainString(newsletter?.title, fallbackNewsletter?.title || ""),
    description: toPlainString(newsletter?.description, fallbackNewsletter?.description || ""),
    buttonText: toPlainString(newsletter?.buttonText, fallbackNewsletter?.buttonText || "Subscribe"),
});

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
        return {
            ...defaultSiteContent,
            heroSlides: defaultSiteContent.heroSlides.map((slide, index) => normalizeHeroSlide(slide, slide, index)),
            featuredCards: defaultSiteContent.featuredCards.map((card, index) => normalizeFeaturedCard(card, card, index)),
            promoBanner: normalizeBanner(defaultSiteContent.promoBanner, defaultSiteContent.promoBanner),
            newsletter: normalizeNewsletter(defaultSiteContent.newsletter, defaultSiteContent.newsletter),
        };
    }

    return {
        heroSlides: Array.isArray(content.heroSlides)
            ? content.heroSlides.map((slide, index) =>
                normalizeHeroSlide(slide, defaultSiteContent.heroSlides[index] || defaultSiteContent.heroSlides[0], index)
            )
            : defaultSiteContent.heroSlides.map((slide, index) => normalizeHeroSlide(slide, slide, index)),
        featuredCards: Array.isArray(content.featuredCards)
            ? content.featuredCards.map((card, index) =>
                normalizeFeaturedCard(card, defaultSiteContent.featuredCards[index] || defaultSiteContent.featuredCards[0], index)
            )
            : defaultSiteContent.featuredCards.map((card, index) => normalizeFeaturedCard(card, card, index)),
        promoBanner: normalizeBanner(content.promoBanner, defaultSiteContent.promoBanner),
        newsletter: normalizeNewsletter(content.newsletter, defaultSiteContent.newsletter),
        aboutPage: defaultSiteContent.aboutPage,
    };
};
