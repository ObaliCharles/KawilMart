'use client'
import React, { startTransition, useState } from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';
import ProductRating from './ProductRating';

// Simulate shop locations (in real system this comes from seller's profile)
const shopLocations = [
  "Kampala, UG", "Entebbe, UG", "Jinja, UG", "Gulu, UG", "Mbarara, UG", "Nairobi, KE"
];

const getShopLocation = (productId) => {
  // Deterministically assign location from product ID
  const index = productId ? productId.charCodeAt(productId.length - 1) % shopLocations.length : 0;
  return shopLocations[index];
};

const ProductCard = ({ product }) => {
    const { router, addToCart, formatCurrency, toggleProductLike } = useAppContext();
    const productHref = `/product/${product._id}`;
    const [liking, setLiking] = useState(false);

    const discountPercent = product.price && product.price > product.offerPrice
      ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
      : null;

    const location = product.location || getShopLocation(product._id);

    const handleLikeClick = async (e) => {
        e.stopPropagation();

        if (liking) {
            return;
        }

        setLiking(true);
        await toggleProductLike(product._id);
        setLiking(false);
    };

    return (
        <div
            onClick={() => {
                startTransition(() => {
                    router.push(productHref);
                });
                scrollTo(0, 0);
            }}
            onMouseEnter={() => router.prefetch(productHref)}
            onFocus={() => router.prefetch(productHref)}
            className="flex flex-col items-start gap-0.5 max-w-[220px] w-full cursor-pointer"
        >
            <div className="cursor-pointer group relative bg-gray-500/10 rounded-lg w-full h-52 flex items-center justify-center overflow-hidden">
                <Image
                    src={product.image[0]}
                    alt={product.name}
                    className="group-hover:scale-105 transition object-cover w-4/5 h-4/5 md:w-full md:h-full"
                    width={300}
                    height={300}
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    priority={false}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
                />
                {/* Discount badge */}
                {discountPercent && (
                  <span className="absolute top-2 left-2 bg-orange-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    -{discountPercent}%
                  </span>
                )}
                <button
                  onClick={handleLikeClick}
                  className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition ${
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

            <p className="md:text-base font-medium pt-2 w-full truncate">{product.name}</p>
            <p className="w-full text-xs text-gray-500/70 max-sm:hidden truncate">{product.description}</p>

            {/* Shop location */}
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <span>📍</span>
              <span>{location}</span>
            </div>

            <ProductRating product={product} />

            <div className="flex items-end justify-between w-full mt-1">
                <div>
                  <p className="text-base font-medium text-orange-600">{formatCurrency(product.offerPrice)}</p>
                  {product.price > product.offerPrice && (
                    <p className="text-xs text-gray-400 line-through">{formatCurrency(product.price)}</p>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); addToCart(product._id); }}
                  className="max-sm:hidden px-4 py-1.5 text-white bg-orange-600 border border-orange-600 rounded-full text-xs hover:bg-orange-700 transition font-medium"
                >
                    Add to Cart
                </button>
            </div>
        </div>
    )
}

export default React.memo(ProductCard)
