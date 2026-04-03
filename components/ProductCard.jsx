'use client'
import React from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';

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
    const { currency, router, addToCart } = useAppContext();

    const discountPercent = product.price && product.price > product.offerPrice
      ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
      : null;

    const location = getShopLocation(product._id);

    return (
        <div
            onClick={() => { router.push('/product/' + product._id); scrollTo(0, 0) }}
            className="flex flex-col items-start gap-0.5 max-w-[220px] w-full cursor-pointer"
        >
            <div className="cursor-pointer group relative bg-gray-500/10 rounded-lg w-full h-52 flex items-center justify-center overflow-hidden">
                <Image
                    src={product.image[0]}
                    alt={product.name}
                    className="group-hover:scale-105 transition object-cover w-4/5 h-4/5 md:w-full md:h-full"
                    width={800}
                    height={800}
                />
                {/* Discount badge */}
                {discountPercent && (
                  <span className="absolute top-2 left-2 bg-orange-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    -{discountPercent}%
                  </span>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); }}
                  className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-red-50 transition"
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

            <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs">{4.5}</p>
                <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Image
                            key={index}
                            className="h-3 w-3"
                            src={index < Math.floor(4) ? assets.star_icon : assets.star_dull_icon}
                            alt="star_icon"
                        />
                    ))}
                </div>
            </div>

            <div className="flex items-end justify-between w-full mt-1">
                <div>
                  <p className="text-base font-medium text-orange-600">{currency}{product.offerPrice.toLocaleString()}</p>
                  {product.price > product.offerPrice && (
                    <p className="text-xs text-gray-400 line-through">{currency}{product.price.toLocaleString()}</p>
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

export default ProductCard
