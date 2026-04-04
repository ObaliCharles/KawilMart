'use client'
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";
import axios from 'axios';

const ProductList = () => {
  const { router, getToken, user, authReady, formatCurrency } = useAppContext();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastShown, setToastShown] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchSellerProduct = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get('/api/product/seller-list', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setProducts(data.products || []);
        setLoading(false);

        //  Show toast only once, even under React Strict Mode
        if (!toastShown) {
          toast.success("Products loaded successfully");
          setToastShown(true);
        }
      } else {
        toast.error(data.message || "Failed to fetch products");
        setLoading(false);
      }

    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Something went wrong");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authReady && user) {
      fetchSellerProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, user]);

  const handleDeleteProduct = async (productId) => {
    const shouldDelete = window.confirm("Delete this product? This action cannot be undone.");
    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingId(productId);
      const token = await getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const { data } = await axios.post('/api/product/delete', { productId }, { headers });

      if (data.success) {
        setProducts((prevProducts) => prevProducts.filter((product) => product._id !== productId));
        toast.success(data.message);
      } else {
        toast.error(data.message || "Failed to delete product");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      {loading ? <Loading /> : (
        <div className="w-full md:p-10 p-4">
          <h2 className="pb-4 text-lg font-medium">All Products</h2>
          <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
            <div className="overflow-x-auto w-full">
              <table className="table-fixed w-full">
                <thead className="text-gray-900 text-sm text-left">
                  <tr>
                    <th className="w-2/3 md:w-2/5 px-4 py-3 font-medium truncate">Product</th>
                    <th className="px-4 py-3 font-medium truncate max-sm:hidden">Category</th>
                    <th className="px-4 py-3 font-medium truncate">Price</th>
                    <th className="px-4 py-3 font-medium truncate">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-500">
                  {Array.isArray(products) && products.length > 0 ? (
                    products.map((product, index) => (
                      <tr key={product._id || index} className="border-t border-gray-500/20">
                        <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                          <div className="bg-gray-500/10 rounded p-2">
                            {product.image?.[0] && (
                              <Image
                                src={product.image[0]}
                                alt={product.name || "product image"}
                                className="w-16"
                                width={1280}
                                height={720}
                              />
                            )}
                          </div>
                          <span className="truncate w-full">{product.name}</span>
                        </td>
                        <td className="px-4 py-3 max-sm:hidden">{product.category}</td>
                        <td className="px-4 py-3">{formatCurrency(product.offerPrice)}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => router.push(`/product/${product._id}`)}
                              className="flex items-center gap-1 px-3 py-2 bg-orange-600 text-white rounded-md"
                            >
                              <span>Visit</span>
                              <Image
                                className="h-3.5"
                                src={assets.redirect_icon}
                                alt="redirect_icon"
                              />
                            </button>
                            <button
                              onClick={() => router.push(`/seller?edit=${product._id}`)}
                              className="px-3 py-2 border border-blue-200 text-blue-700 rounded-md hover:bg-blue-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              disabled={deletingId === product._id}
                              className="px-3 py-2 border border-red-200 text-red-700 rounded-md hover:bg-red-50 disabled:opacity-60"
                            >
                              {deletingId === product._id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-4">
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ProductList;
