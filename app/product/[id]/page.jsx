"use client"
import { useEffect, useRef, useState } from "react";
import { assets } from "@/assets/assets";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import React from "react";
import ProductRating from "@/components/ProductRating";
import { ProductDetailSkeleton } from "@/components/PageSkeletons";
import ProductActivityChips from "@/components/ProductActivityChips";
import SellerTrustBadge from "@/components/SellerTrustBadge";
import { getLocationLabel, getProductActivitySnapshot, sortProductsForLiveShowcase } from "@/lib/liveCommerce";
import { getProductStockSnapshot } from "@/lib/productStock";

const Product = () => {

    const { id } = useParams();

    const { products, addToCart, formatCurrency, navigate, prefetchRoute, toggleProductLike } = useAppContext()

    const [mainImage, setMainImage] = useState(null);
    const [productData, setProductData] = useState(null);
    const [liking, setLiking] = useState(false);
    const [cartAction, setCartAction] = useState(null);
    const [addedFeedback, setAddedFeedback] = useState(false);
    const feedbackTimeoutRef = useRef(null);

    const fetchProductData = async () => {
        const product = products.find(product => product._id === id);
        setProductData(product);
    }

    useEffect(() => {
        fetchProductData();
        // Product details are derived from route params and context products.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, products])

    const handleLikeClick = async () => {
        if (!productData || liking) {
            return;
        }

        setLiking(true);
        await toggleProductLike(productData._id);
        setLiking(false);
    };

    const handleAddToCart = async () => {
        if (!productData || cartAction) {
            return;
        }

        setCartAction('add');
        const result = await addToCart(productData._id);
        setCartAction(null);

        if (result?.success) {
            setAddedFeedback(true);
            if (feedbackTimeoutRef.current) {
                window.clearTimeout(feedbackTimeoutRef.current);
            }

            feedbackTimeoutRef.current = window.setTimeout(() => {
                setAddedFeedback(false);
            }, 1400);
        }
    };

    const handleBuyNow = async () => {
        if (!productData || cartAction) {
            return;
        }

        setCartAction('buy');
        const result = await addToCart(productData._id);

        if (result?.success) {
            navigate('/cart');
        } else {
            setCartAction(null);
        }
    };

    const productActivity = productData ? getProductActivitySnapshot(productData) : null;
    const stockSnapshot = productData ? getProductStockSnapshot(productData) : null;
    const isOutOfStock = stockSnapshot?.status === 'out';
    const relatedProducts = sortProductsForLiveShowcase(
        products.filter((product) => product._id !== id)
    ).slice(0, 5);

    useEffect(() => {
        return () => {
            if (feedbackTimeoutRef.current) {
                window.clearTimeout(feedbackTimeoutRef.current);
            }
        };
    }, []);

    return productData ? (<>
        <Navbar />
        <div className="space-y-10 px-4 pt-8 sm:px-6 md:px-12 md:pt-14 lg:px-24 xl:px-32">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
                <div className="px-0 sm:px-4 lg:px-10 xl:px-16">
                    <div className="mb-4 overflow-hidden rounded-lg bg-gray-500/10">
                        <Image
                            src={mainImage || productData.image[0]}
                            alt={productData.name}
                            className="aspect-square w-full bg-[#faf8f4] object-contain p-4"
                            width={1280}
                            height={720}
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>

                    <div className="grid grid-cols-4 gap-2 sm:gap-4">
                        {productData.image.map((image, index) => (
                            <div
                                key={index}
                                onClick={() => setMainImage(image)}
                                className="cursor-pointer overflow-hidden rounded-lg bg-gray-500/10"
                            >
                                <Image
                                    src={image}
                                    alt={`${productData.name} preview ${index + 1}`}
                                    className="aspect-square w-full bg-[#faf8f4] object-contain p-2"
                                    width={1280}
                                    height={720}
                                    sizes="(max-width: 768px) 22vw, 10vw"
                                />
                            </div>

                        ))}
                    </div>
                </div>

                <div className="flex min-w-0 flex-col">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <h1 className="text-2xl font-medium text-gray-800/90 sm:text-3xl">
                            {productData.name}
                        </h1>
                        <button
                            onClick={handleLikeClick}
                            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition sm:text-sm ${
                                productData.likedByCurrentUser
                                    ? "border-orange-200 bg-orange-50 text-orange-700"
                                    : "border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:text-orange-600"
                            } ${liking ? "opacity-60" : ""}`}
                        >
                            {productData.likedByCurrentUser ? "Liked" : "Like"} · {productData.likesCount || 0}
                        </button>
                    </div>
                    <ProductRating product={productData} size="lg" />
                    <ProductActivityChips product={productData} maxItems={4} className="mt-4" />
                    <p className="text-gray-600 mt-3">
                        {productData.description}
                    </p>
                    <p className="mt-6 text-2xl font-medium sm:text-3xl">
                        {formatCurrency(productData.offerPrice)}
                        {productActivity?.hasDiscount ? (
                            <span className="ml-2 text-base font-normal text-gray-800/60 line-through">
                                {formatCurrency(productData.price)}
                            </span>
                        ) : null}
                    </p>
                    <hr className="bg-gray-600 my-6" />
                    <div className="overflow-x-auto">
                        <table className="table-auto border-collapse w-full max-w-md">
                            <tbody>
                                <tr>
                                    <td className="text-gray-600 font-medium">Store</td>
                                    <td className="text-gray-800/50 ">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span>{productData.sellerProfile?.name || 'Marketplace seller'}</span>
                                            <SellerTrustBadge sellerProfile={productData.sellerProfile} />
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-gray-600 font-medium">Business area</td>
                                    <td className="text-gray-800/50 ">
                                        {productData.sellerProfile?.location || productData.sellerLocation || 'Location pending'}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-gray-600 font-medium">Category</td>
                                    <td className="text-gray-800/50">
                                        {productData.category}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-gray-600 font-medium">Item location</td>
                                    <td className="text-gray-800/50">
                                        {productData.location || productData.sellerLocation || 'Location pending'}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-gray-600 font-medium">Availability</td>
                                    <td className="text-gray-800/50">
                                        {stockSnapshot?.label || 'Stock updates soon'}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {productActivity ? (
                        <div className="mt-6 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-3">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-500">You save</p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {productActivity.hasDiscount ? formatCurrency(productActivity.savingsAmount) : 'Current best price'}
                                </p>
                            </div>
                            <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-600">Buyer feedback</p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {productActivity.hasRating
                                        ? `${productActivity.displayRating}/5`
                                        : `${productActivity.likesCount} like${productActivity.likesCount === 1 ? '' : 's'}`}
                                </p>
                            </div>
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-600">
                                    {stockSnapshot?.hasTrackedStock ? 'Stock level' : productActivity.flashDealCountdownLabel ? 'Deal window' : 'Available in'}
                                </p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {stockSnapshot?.hasTrackedStock
                                        ? stockSnapshot.label
                                        : productActivity.flashDealCountdownLabel
                                        ? `Ends in ${productActivity.flashDealCountdownLabel}`
                                        : productActivity.localTrend}
                                </p>
                            </div>
                        </div>
                    ) : null}

                    {/* Seller Information */}
                    <div className="mt-8 rounded-lg bg-blue-50 p-4">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Seller Information</h3>
                        <div className="space-y-2 text-sm">
                            <p>
                                <strong>Store:</strong>{" "}
                                {productData.sellerProfile?.name || 'Seller'}
                            </p>
                            <SellerTrustBadge sellerProfile={productData.sellerProfile} />
                            <p><strong>Business Location:</strong> {productData.sellerProfile?.location || productData.sellerLocation || 'Location pending'}</p>
                            <p><strong>Product Location:</strong> {productData.location || productData.sellerLocation || 'Location pending'}</p>
                            <p>
                                <strong>Seller Rating:</strong>{" "}
                                {productData.sellerProfile?.ratingSummary?.totalReviews
                                    ? `${productData.sellerProfile?.ratingSummary?.overall || 0} / 5 (${productData.sellerProfile?.ratingSummary?.totalReviews || 0} reviews)`
                                    : 'No seller reviews yet'}
                            </p>
                            <p><strong>Trending near:</strong> {getLocationLabel(productData.sellerLocation || productData.location)}</p>
                            <p className="rounded-xl bg-white/70 px-3 py-2 text-xs text-blue-800">
                                Seller contact unlocks only after you place an order and the seller accepts it in KawilMart.
                            </p>
                        </div>
                    </div>

                    {/* Reviews Section */}
                    {productData.reviews && productData.reviews.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-lg font-medium text-gray-800 mb-4">Customer Reviews ({productData.reviews.length})</h3>
                            <div className="space-y-4">
                                {productData.reviews.map((review, index) => (
                                    <div key={index} className="rounded-lg border border-gray-200 p-4">
                                        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <span className="font-medium">{review.userName}</span>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Image
                                                        key={i}
                                                        src={i < review.rating ? assets.star_icon : assets.star_dull_icon}
                                                        alt="star"
                                                        className="h-4 w-4"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-sm">{review.comment}</p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {new Date(review.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                        <button
                            onClick={handleAddToCart}
                            disabled={!!cartAction || isOutOfStock}
                            className={`w-full rounded-lg py-3.5 transition ${
                                isOutOfStock
                                    ? 'cursor-not-allowed bg-slate-100 text-slate-500'
                                    : cartAction
                                    ? 'cursor-wait bg-gray-200 text-gray-500'
                                    : addedFeedback
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-gray-100 text-gray-800/80 hover:bg-gray-200'
                            }`}
                        >
                            {isOutOfStock ? 'Sold out' : cartAction === 'add' ? 'Adding...' : addedFeedback ? 'Added ✓' : 'Add to Cart'}
                        </button>
                        <button
                            onClick={handleBuyNow}
                            disabled={!!cartAction || isOutOfStock}
                            className={`w-full rounded-lg py-3.5 text-white transition ${
                                isOutOfStock
                                    ? 'cursor-not-allowed bg-slate-400'
                                    : cartAction
                                    ? 'cursor-wait bg-orange-400'
                                    : 'bg-orange-500 hover:bg-orange-600'
                            }`}
                        >
                            {isOutOfStock ? 'Unavailable' : cartAction === 'buy' ? 'Adding...' : 'Buy now'}
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-center">
                <div className="flex flex-col items-center mb-4 mt-16">
                    <p className="text-center text-2xl font-medium sm:text-3xl">Hot <span className="font-medium text-orange-600">Right Now</span></p>
                    <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
                </div>
                <div className="mt-6 grid w-full grid-cols-1 gap-3 pb-14 min-[340px]:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-6">
                    {relatedProducts.map((product) => <ProductCard key={product._id} product={product} />)}
                </div>
                <button
                    onClick={() => navigate('/all-products')}
                    onMouseEnter={() => prefetchRoute('/all-products')}
                    onFocus={() => prefetchRoute('/all-products')}
                    className="mb-16 w-full rounded border px-8 py-2 text-gray-500/70 transition hover:bg-slate-50/90 sm:w-auto"
                >
                    See more
                </button>
            </div>
        </div>
        <Footer />
    </>
    ) : (
        <>
            <Navbar />
            <ProductDetailSkeleton />
            <Footer />
        </>
    )
};

export default Product;
