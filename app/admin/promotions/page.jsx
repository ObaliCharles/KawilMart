'use client'
import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import Loading from '@/components/Loading';
import Image from 'next/image';

export default function AdminPromotions() {
    const { getToken, user } = useAppContext();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [promotionData, setPromotionData] = useState({
        isFlashDeal: false,
        flashDealEndDate: '',
        promotionType: 'none'
    });

    useEffect(() => {
        if (user) fetchProducts();
    }, [user]);

    const fetchProducts = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/product/list', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) setProducts(data.products);
            else toast.error(data.message);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updatePromotion = async () => {
        if (!selectedProduct) return;

        try {
            const token = await getToken();
            const { data } = await axios.post('/api/admin/update-promotion',
                {
                    productId: selectedProduct._id,
                    ...promotionData,
                    flashDealEndDate: promotionData.flashDealEndDate ? new Date(promotionData.flashDealEndDate) : null
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                toast.success('Promotion updated successfully');
                setProducts(prev => prev.map(p =>
                    p._id === selectedProduct._id
                        ? { ...p, ...promotionData, flashDealEndDate: promotionData.flashDealEndDate ? new Date(promotionData.flashDealEndDate) : null }
                        : p
                ));
                setSelectedProduct(null);
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error('Failed to update promotion');
        }
    };

    const endFlashDeal = async (productId) => {
        try {
            const token = await getToken();
            const { data } = await axios.post('/api/admin/update-promotion',
                { productId, isFlashDeal: false, flashDealEndDate: null },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                toast.success('Flash deal ended');
                setProducts(prev => prev.map(p =>
                    p._id === productId ? { ...p, isFlashDeal: false, flashDealEndDate: null } : p
                ));
            }
        } catch (err) {
            toast.error('Failed to end flash deal');
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="w-full md:p-10 p-4">
            <h2 className="pb-4 text-lg font-medium">Product Promotions Management</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {products.map((product) => (
                    <div key={product._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center space-x-4 mb-4">
                            <Image
                                src={product.image[0]}
                                alt={product.name}
                                width={60}
                                height={60}
                                className="rounded"
                            />
                            <div className="flex-1">
                                <h3 className="font-medium text-sm">{product.name}</h3>
                                <p className="text-xs text-gray-500">UGX {product.offerPrice.toLocaleString()}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {product.isFlashDeal && (
                                        <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded">
                                            🔥 Flash Deal
                                        </span>
                                    )}
                                    {product.promotionType === 'featured' && (
                                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">
                                            ⭐ Featured
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {product.isFlashDeal && product.flashDealEndDate && (
                                <p className="text-xs text-red-600">
                                    Ends: {new Date(product.flashDealEndDate).toLocaleDateString()}
                                </p>
                            )}
                        </div>

                        <div className="flex space-x-2 mt-4">
                            <button
                                onClick={() => setSelectedProduct(product)}
                                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                            >
                                Manage
                            </button>
                            {product.isFlashDeal && (
                                <button
                                    onClick={() => endFlashDeal(product._id)}
                                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                                >
                                    End Deal
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Promotion Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-medium mb-4">Manage Promotion: {selectedProduct.name}</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Promotion Type</label>
                                <select
                                    value={promotionData.promotionType}
                                    onChange={(e) => setPromotionData(prev => ({ ...prev, promotionType: e.target.value }))}
                                    className="w-full p-2 border border-gray-300 rounded"
                                >
                                    <option value="none">None</option>
                                    <option value="flash_deal">Flash Deal</option>
                                    <option value="featured">Featured</option>
                                    <option value="discount">Discount</option>
                                </select>
                            </div>

                            {promotionData.promotionType === 'flash_deal' && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Flash Deal End Date</label>
                                    <input
                                        type="datetime-local"
                                        value={promotionData.flashDealEndDate}
                                        onChange={(e) => setPromotionData(prev => ({ ...prev, flashDealEndDate: e.target.value }))}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex space-x-2 mt-6">
                            <button
                                onClick={updatePromotion}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Update Promotion
                            </button>
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}