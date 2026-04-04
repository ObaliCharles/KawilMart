"use client"
import { useEffect, useState } from "react";
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

const Product = () => {

    const { id } = useParams();

    const { products, addToCart, formatCurrency, navigate, prefetchRoute, toggleProductLike } = useAppContext()

    const [mainImage, setMainImage] = useState(null);
    const [productData, setProductData] = useState(null);
    const [liking, setLiking] = useState(false);
    const [cartAction, setCartAction] = useState(null);

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
        await addToCart(productData._id);
        setCartAction(null);
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

    return productData ? (<>
        <Navbar />
        <div className="space-y-10 px-4 pt-8 sm:px-6 md:px-12 md:pt-14 lg:px-24 xl:px-32">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
                <div className="px-0 sm:px-4 lg:px-10 xl:px-16">
                    <div className="mb-4 overflow-hidden rounded-lg bg-gray-500/10">
                        <Image
                            src={mainImage || productData.image[0]}
                            alt="alt"
                            className="aspect-square w-full object-cover mix-blend-multiply"
                            width={1280}
                            height={720}
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
                                    alt="alt"
                                    className="aspect-square w-full object-cover mix-blend-multiply"
                                    width={1280}
                                    height={720}
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
                    <p className="text-gray-600 mt-3">
                        {productData.description}
                    </p>
                    <p className="mt-6 text-2xl font-medium sm:text-3xl">
                        {formatCurrency(productData.offerPrice)}
                        <span className="text-base font-normal text-gray-800/60 line-through ml-2">
                            {formatCurrency(productData.price)}
                        </span>
                    </p>
                    <hr className="bg-gray-600 my-6" />
                    <div className="overflow-x-auto">
                        <table className="table-auto border-collapse w-full max-w-72">
                            <tbody>
                                <tr>
                                    <td className="text-gray-600 font-medium">Brand</td>
                                    <td className="text-gray-800/50 ">Generic</td>
                                </tr>
                                <tr>
                                    <td className="text-gray-600 font-medium">Color</td>
                                    <td className="text-gray-800/50 ">Multi</td>
                                </tr>
                                <tr>
                                    <td className="text-gray-600 font-medium">Category</td>
                                    <td className="text-gray-800/50">
                                        {productData.category}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-gray-600 font-medium">Location</td>
                                    <td className="text-gray-800/50">
                                        {productData.location}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Seller Information */}
                    <div className="mt-8 rounded-lg bg-blue-50 p-4">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Seller Information</h3>
                        <div className="space-y-2 text-sm">
                            <p><strong>Contact:</strong> {productData.sellerContact}</p>
                            <p><strong>Business Location:</strong> {productData.sellerLocation}</p>
                            <p><strong>Product Location:</strong> {productData.location}</p>
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
                            disabled={!!cartAction}
                            className={`w-full rounded-lg py-3.5 transition ${
                                cartAction
                                    ? 'cursor-wait bg-gray-200 text-gray-500'
                                    : 'bg-gray-100 text-gray-800/80 hover:bg-gray-200'
                            }`}
                        >
                            {cartAction === 'add' ? 'Adding...' : 'Add to Cart'}
                        </button>
                        <button
                            onClick={handleBuyNow}
                            disabled={!!cartAction}
                            className={`w-full rounded-lg py-3.5 text-white transition ${
                                cartAction
                                    ? 'cursor-wait bg-orange-400'
                                    : 'bg-orange-500 hover:bg-orange-600'
                            }`}
                        >
                            {cartAction === 'buy' ? 'Adding...' : 'Buy now'}
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-center">
                <div className="flex flex-col items-center mb-4 mt-16">
                    <p className="text-center text-2xl font-medium sm:text-3xl">Featured <span className="font-medium text-orange-600">Products</span></p>
                    <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
                </div>
                <div className="mt-6 grid w-full grid-cols-2 gap-4 pb-14 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-6">
                    {products.slice(0, 5).map((product, index) => <ProductCard key={index} product={product} />)}
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
