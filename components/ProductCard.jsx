'use client'
import React, { useEffect, useRef, useState } from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';
import { getCategoryMeta } from '@/lib/marketplaceCategories';
import ProductRating from './ProductRating';
import ProductActivityChips from './ProductActivityChips';
import { getProductStockSnapshot } from '@/lib/productStock';
import SellerTrustBadge from './SellerTrustBadge';

const getPromotionBadge = (product) => {
    if (product.isFlashDeal || product.promotionType === 'flash_deal') {
        return { label: 'Flash Deal', className: 'bg-red-100 text-red-700' };
    }

    if (product.promotionType === 'discount') {
        return { label: 'Discount', className: 'bg-orange-100 text-orange-700' };
    }

    if (product.promotionType === 'featured') {
        return { label: 'Featured', className: 'bg-blue-100 text-blue-700' };
    }

    return null;
};

const ProductCard = ({ product }) => {
    const { addToCart, formatCurrency, navigate, prefetchRoute, toggleProductLike } = useAppContext();
    const productHref = `/product/${product._id}`;
    const [liking, setLiking] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [addedFeedback, setAddedFeedback] = useState(false);
    const [descriptionExpanded, setDescriptionExpanded] = useState(false);
    const feedbackTimeoutRef = useRef(null);

    const discountPercent = product.price && product.price > product.offerPrice
      ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
      : null;

    const location = product.sellerProfile?.location || product.sellerLocation || product.location || "Location pending";
    const promotionBadge = getPromotionBadge(product);
    const stockSnapshot = getProductStockSnapshot(product);
    const isOutOfStock = stockSnapshot.status === 'out';
    const categoryLabel = getCategoryMeta(product.category).label;
    const description = typeof product.description === "string" ? product.description.trim() : "";
    const showDescriptionToggle = description.length > 72;
    const stockToneClassName = {
        in_stock: 'border-emerald-100 bg-emerald-50 text-emerald-700',
        low: 'border-amber-100 bg-amber-50 text-amber-700',
        out: 'border-slate-200 bg-slate-100 text-slate-600',
        untracked: 'border-gray-200 bg-gray-50 text-gray-500',
    }[stockSnapshot.status] || 'border-gray-200 bg-gray-50 text-gray-500';

    const handleLikeClick = async (e) => {
        e.stopPropagation();

        if (liking) {
            return;
        }

        setLiking(true);
        await toggleProductLike(product._id);
        setLiking(false);
    };

    const handleAddToCart = async (e) => {
        e.stopPropagation();

        if (isAdding) {
            return;
        }

        setIsAdding(true);
        const result = await addToCart(product._id);
        setIsAdding(false);

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

    const handleDescriptionToggle = (e) => {
        e.stopPropagation();
        setDescriptionExpanded((prev) => !prev);
    };

    useEffect(() => {
        return () => {
            if (feedbackTimeoutRef.current) {
                window.clearTimeout(feedbackTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div
            onClick={() => {
                navigate(productHref);
                scrollTo(0, 0);
            }}
            onMouseEnter={() => prefetchRoute(productHref)}
            onFocus={() => prefetchRoute(productHref)}
            className="group flex h-full w-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-[1.45rem] border border-gray-200 bg-white p-2.5 shadow-[0_12px_32px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-[0_18px_40px_rgba(249,115,22,0.14)] sm:p-3"
        >
            <div className="relative flex aspect-[1/0.92] w-full items-center justify-center overflow-hidden rounded-[1.1rem] bg-gradient-to-br from-[#fff7ed] via-[#f9fafb] to-[#eef2ff]">
                <Image
                    src={product.image[0]}
                    alt={product.name}
                    className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-105 sm:p-4"
                    width={300}
                    height={300}
                    sizes="(max-width: 639px) 44vw, (max-width: 1023px) 30vw, (max-width: 1535px) 22vw, 18vw"
                    priority={false}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
                />
                {discountPercent && (
                  <span className="absolute left-2 top-2 rounded-full bg-orange-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                    -{discountPercent}%
                  </span>
                )}
                <button
                  onClick={handleLikeClick}
                  className={`absolute right-2 top-2 rounded-full p-2 shadow-md transition ${
                    product.likedByCurrentUser
                      ? "bg-orange-100 ring-1 ring-orange-200"
                      : "bg-white hover:bg-red-50"
                  } ${liking ? "opacity-60" : ""}`}
                  aria-label={product.likedByCurrentUser ? "Unlike product" : "Like product"}
                >
                    <Image
                        className="h-3 w-3"
                        src={assets.heart_icon}
                        alt="heart_icon"
                    />
                </button>
            </div>

            <p className="mt-3 w-full truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                {categoryLabel}
            </p>
            <p className="mt-1 min-h-[2.55rem] w-full line-clamp-2 text-sm font-semibold leading-5 text-gray-900 sm:min-h-[2.8rem] sm:text-[15px] sm:leading-6">
                {product.name}
            </p>

            <div className="mt-2 flex w-full flex-wrap items-center gap-2">
              {promotionBadge ? (
                <div className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${promotionBadge.className}`}>
                  {promotionBadge.label}
                </div>
              ) : null}
              <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${stockToneClassName}`}>
                {stockSnapshot.shortLabel}
              </span>
            </div>

            <ProductActivityChips product={product} compact maxItems={1} className="mt-2" />
            {description ? (
              <>
                {descriptionExpanded ? (
                  <div className="mt-2 w-full rounded-[1rem] border border-orange-100 bg-orange-50/70 px-3 py-2 text-xs leading-5 text-gray-600 [overflow-wrap:anywhere]">
                    {description}
                  </div>
                ) : (
                  <p className="mt-2 w-full line-clamp-1 text-xs leading-5 text-gray-500 [overflow-wrap:anywhere] sm:line-clamp-2">
                    {description}
                  </p>
                )}
                {showDescriptionToggle ? (
                  <button
                    type="button"
                    onClick={handleDescriptionToggle}
                    aria-expanded={descriptionExpanded}
                    className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600 transition hover:bg-orange-50 hover:text-orange-700"
                  >
                    {descriptionExpanded ? 'Less' : 'More'}
                    <span className={`text-[10px] transition-transform ${descriptionExpanded ? 'rotate-180' : ''}`}>⌄</span>
                  </button>
                ) : null}
              </>
            ) : null}

            <div className="mt-2 flex w-full items-center gap-1.5 text-[11px] text-gray-400">
              <span>📍</span>
              <span className="truncate">{location}</span>
            </div>
            <SellerTrustBadge sellerProfile={product.sellerProfile} className="mt-2 hidden sm:inline-flex" />

            <div className="mt-2">
              <ProductRating product={product} showMeta={false} />
            </div>

            <div className="mt-auto flex w-full flex-col gap-3 pt-3 min-[390px]:flex-row min-[390px]:items-end min-[390px]:justify-between">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-orange-600">{formatCurrency(product.offerPrice)}</p>
                  {product.price > product.offerPrice && (
                    <p className="text-xs text-gray-400 line-through">{formatCurrency(product.price)}</p>
                  )}
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || isOutOfStock}
                  className={`w-full rounded-full border px-3 py-2 text-xs font-semibold transition min-[390px]:w-auto min-[390px]:px-4 ${
                    isOutOfStock
                      ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500'
                      : isAdding
                      ? 'cursor-wait border-orange-500 bg-orange-500 text-white opacity-75'
                      : addedFeedback
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-orange-600 bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                >
                    {isOutOfStock ? 'Sold out' : isAdding ? 'Adding...' : addedFeedback ? 'Added ✓' : 'Add'}
                </button>
            </div>
        </div>
    )
}

export default React.memo(ProductCard)
