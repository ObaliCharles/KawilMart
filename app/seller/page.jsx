'use client'
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";
import axios from 'axios';
import { useSearchParams } from "next/navigation";
import { SellerProductFormSkeleton } from "@/components/dashboard/DashboardSkeletons";


const AddProductInner = () => {

  const { getToken, router, authReady, user } = useAppContext();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = Boolean(editId);

  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Earphone');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [location, setLocation] = useState('');
  const [sellerContact, setSellerContact] = useState('');
  const [sellerLocation, setSellerLocation] = useState('');
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const imagePreviews = useMemo(() => (
    [...Array(4)].map((_, index) => (
      files[index]
        ? URL.createObjectURL(files[index])
        : existingImages[index] || assets.upload_area
    ))
  ), [existingImages, files]);

  const resetForm = () => {
    setFiles([]);
    setExistingImages([]);
    setName('');
    setDescription('');
    setCategory('Earphone');
    setPrice('');
    setOfferPrice('');
    setLocation('');
    setSellerContact('');
    setSellerLocation('');
  };

  const fetchProductDetails = async () => {
    if (!editId) {
      resetForm();
      return;
    }

    try {
      setLoadingProduct(true);
      const token = await getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const { data } = await axios.get(`/api/product/seller-item?productId=${editId}`, { headers });

      if (data.success) {
        const product = data.product;
        setFiles([]);
        setExistingImages(product.image || []);
        setName(product.name || '');
        setDescription(product.description || '');
        setCategory(product.category || 'Earphone');
        setPrice(product.price?.toString() || '');
        setOfferPrice(product.offerPrice?.toString() || '');
        setLocation(product.location || '');
        setSellerContact(product.sellerContact || '');
        setSellerLocation(product.sellerLocation || '');
      } else {
        toast.error(data.message || 'Failed to load product details');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Failed to load product details');
    } finally {
      setLoadingProduct(false);
    }
  };

  useEffect(() => {
    if (authReady && user) {
      fetchProductDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, user, editId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    const formData = new FormData();

    formData.append('name', name)
    formData.append('description', description)
    formData.append('category', category)
    formData.append('price', price)
    formData.append('offerPrice', offerPrice)
    formData.append('location', location)
    formData.append('sellerContact', sellerContact)
    formData.append('sellerLocation', sellerLocation)

    if (isEditMode) {
      formData.append('productId', editId)
      formData.append('existingImages', JSON.stringify(existingImages))
      for (let i = 0; i < 4; i += 1) {
        if (files[i]) {
          formData.append(`image_${i}`, files[i])
        }
      }
    } else {
      if (!files.filter(Boolean).length) {
        toast.error('Please upload at least one product image')
        return
      }

      for (let i = 0; i < files.length; i++) {
        if (files[i]) {
          formData.append('images', files[i])
        }
      }
    }

    try {
      setIsSubmitting(true);
      const token = await getToken()
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const endpoint = isEditMode ? '/api/product/update' : '/api/product/add'
      const { data } = await axios.post(endpoint, formData, { headers })

      if (data.success) {
        toast.success(data.message)
        if (isEditMode) {
          router.push('/seller/product-list')
        } else {
          resetForm();
        }
      } else{
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      {loadingProduct ? (
        <SellerProductFormSkeleton />
      ) : (
      <form onSubmit={handleSubmit} className="md:p-10 p-4 space-y-5 max-w-lg">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Edit Product Details' : 'Add Product'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isEditMode
              ? 'Update your product information here. Existing images stay unless you replace them.'
              : 'Add a new product to your seller catalog.'}
          </p>
        </div>
        <div>
          <p className="text-base font-medium">Product Image</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">

            {[...Array(4)].map((_, index) => (
              <label key={index} htmlFor={`image${index}`}>
                <input onChange={(e) => {
                  const updatedFiles = [...files];
                  updatedFiles[index] = e.target.files[0];
                  setFiles(updatedFiles);
                }} type="file" id={`image${index}`} hidden />
                <Image
                  key={index}
                  className="max-w-24 cursor-pointer"
                  src={imagePreviews[index]}
                  alt=""
                  width={100}
                  height={100}
                />
              </label>
            ))}

          </div>
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-name">
            Product Name
          </label>
          <input
            id="product-name"
            type="text"
            placeholder="Type here"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            onChange={(e) => setName(e.target.value)}
            value={name}
            required
          />
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label
            className="text-base font-medium"
            htmlFor="product-description"
          >
            Product Description
          </label>
          <textarea
            id="product-description"
            rows={4}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
            placeholder="Type here"
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            required
          ></textarea>
        </div>
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setCategory(e.target.value)}
              value={category}
            >
              <option value="Earphone">Earphone</option>
              <option value="Headphone">Headphone</option>
              <option value="Watch">Watch</option>
              <option value="Smartphone">Smartphone</option>
              <option value="Laptop">Laptop</option>
              <option value="Camera">Camera</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="product-price">
              Product Price
            </label>
            <input
              id="product-price"
              type="number"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              required
            />
          </div>
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="offer-price">
              Offer Price
            </label>
            <input
              id="offer-price"
              type="number"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setOfferPrice(e.target.value)}
              value={offerPrice}
              required
            />
          </div>
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="location">
            Product Location
          </label>
          <input
            id="location"
            type="text"
            placeholder="e.g., Kampala, Uganda"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            onChange={(e) => setLocation(e.target.value)}
            value={location}
            required
          />
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="seller-contact">
            Your Contact Number
          </label>
          <input
            id="seller-contact"
            type="tel"
            placeholder="+256 XXX XXX XXX"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            onChange={(e) => setSellerContact(e.target.value)}
            value={sellerContact}
            required
          />
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="seller-location">
            Your Business Location
          </label>
          <input
            id="seller-location"
            type="text"
            placeholder="e.g., Nakasero, Kampala"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            onChange={(e) => setSellerLocation(e.target.value)}
            value={sellerLocation}
            required
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-2.5 text-white font-medium rounded transition ${
              isSubmitting ? 'cursor-wait bg-orange-400' : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {isSubmitting ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'UPDATE' : 'ADD')}
          </button>
          {isEditMode && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => router.push('/seller/product-list')}
              className={`px-6 py-2.5 border font-medium rounded transition ${
                isSubmitting
                  ? 'cursor-not-allowed border-gray-200 text-gray-400'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      )}
      {/* <Footer /> */}
    </div>
  );
};

const AddProduct = () => (
  <Suspense fallback={<SellerProductFormSkeleton />}>
    <AddProductInner />
  </Suspense>
);

export default AddProduct;
