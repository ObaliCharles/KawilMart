'use client'

import { useAppContext } from "@/context/AppContext";
import { DELIVERY_MODES, calculateDeliveryFee } from "@/lib/orderLifecycle";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const OrderSummary = () => {
  const {
    router,
    getCartCount,
    getCartAmount,
    getToken,
    user,
    products,
    cartItems,
    setCartItems,
    authReady,
    formatCurrency,
    fetchUserData,
  } = useAppContext();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState(DELIVERY_MODES.DELIVERY);
  const cartAmount = getCartAmount();

  const estimatedDeliveryFee = useMemo(() => {
    if (!selectedAddress || deliveryMode === DELIVERY_MODES.PICKUP) {
      return 0;
    }

    const sellerLocations = new Map();

    Object.entries(cartItems).forEach(([productId, quantity]) => {
      if (quantity <= 0) {
        return;
      }

      const product = products.find((entry) => entry._id === productId);
      if (!product?.userId) {
        return;
      }

      if (!sellerLocations.has(product.userId)) {
        sellerLocations.set(product.userId, product.sellerLocation || product.location || "");
      }
    });

    return Array.from(sellerLocations.values()).reduce((sum, sellerLocation) => sum + calculateDeliveryFee({
      deliveryMode,
      sellerLocation,
      address: selectedAddress,
    }), 0);
  }, [cartItems, deliveryMode, products, selectedAddress]);

  const totalAmount = cartAmount + estimatedDeliveryFee;

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

  const createOrder = async () => {
    if (isPlacingOrder) {
      return;
    }

    try {
      if (!selectedAddress) return toast.error("Please select an address");

      const cartItemsArray = Object.entries(cartItems)
        .filter(([key, quantity]) => quantity > 0)
        .map(([key, quantity]) => ({ product: key, quantity }));

      if (cartItemsArray.length === 0) return toast.error("Cart is empty");

      setIsPlacingOrder(true);
      const token = await getToken();
      const { data } = await axios.post(
        "/api/order/create",
        {
          address: selectedAddress._id,
          items: cartItemsArray,
          deliveryMode,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setCartItems({});
        await fetchUserData();
        toast.success(data.message);
        router.replace("/order-placed");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to place order");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  useEffect(() => {
    if (!authReady || !user) {
      return;
    }

    const fetchUserAddresses = async () => {
      try {
        const token = await getToken();
        const { data } = await axios.get("/api/user/get-address", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (data.success) {
          setUserAddresses(data.addresses);
          if (data.addresses.length > 0) {
            setSelectedAddress(data.addresses[0]);
          }
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };

    void fetchUserAddresses();
  }, [authReady, getToken, user]);

  return (
    <div className="w-full md:w-96 bg-gray-500/5 p-5">
      <h2 className="text-xl md:text-2xl font-medium text-gray-700">Order Summary</h2>
      <hr className="border-gray-500/30 my-5" />

      <div className="space-y-6">
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">Select Address</label>
          <div className="relative inline-block w-full text-sm border">
            <button
              className="peer w-full text-left px-4 pr-2 py-2 bg-white text-gray-700 focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isPlacingOrder}
            >
              <span>
                {selectedAddress
                  ? `${selectedAddress.fullName}, ${selectedAddress.area}, ${selectedAddress.city}, ${selectedAddress.state}`
                  : "Select Address"}
              </span>
              <svg
                className={`w-5 h-5 inline float-right transition-transform duration-200 ${isDropdownOpen ? "rotate-0" : "-rotate-90"}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#6B7280"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5">
                {userAddresses.map((address, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer"
                    onClick={() => handleAddressSelect(address)}
                  >
                    {address.fullName}, {address.area}, {address.city}, {address.state}
                  </li>
                ))}
                <li
                  onClick={() => router.push("/add-address")}
                  className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer text-center"
                >
                  + Add New Address
                </li>
              </ul>
            )}
          </div>
        </div>

        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">Fulfillment</label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setDeliveryMode(DELIVERY_MODES.DELIVERY)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                deliveryMode === DELIVERY_MODES.DELIVERY
                  ? "border-orange-500 bg-orange-50 text-orange-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-orange-200"
              }`}
            >
              <p className="font-medium">Delivery</p>
              <p className="mt-1 text-xs text-gray-500">One rider will be assigned and must accept before contacts unlock.</p>
            </button>
            <button
              type="button"
              onClick={() => setDeliveryMode(DELIVERY_MODES.PICKUP)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                deliveryMode === DELIVERY_MODES.PICKUP
                  ? "border-orange-500 bg-orange-50 text-orange-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-orange-200"
              }`}
            >
              <p className="font-medium">Pickup</p>
              <p className="mt-1 text-xs text-gray-500">Collect directly from the seller after they accept your order.</p>
            </button>
          </div>
        </div>

        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">Promo Code</label>
          <div className="flex flex-col items-start gap-3">
            <input
              type="text"
              placeholder="Enter promo code"
              className="flex-grow w-full outline-none p-2.5 text-gray-600 border"
            />
            <button className="bg-orange-600 text-white px-9 py-2 hover:bg-orange-700">Apply</button>
          </div>
        </div>

        <hr className="border-gray-500/30 my-5" />

        <div className="space-y-4">
          <div className="flex justify-between text-base font-medium">
            <p className="uppercase text-gray-600">Items {getCartCount()}</p>
            <p className="text-gray-800">{formatCurrency(cartAmount)}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">{deliveryMode === DELIVERY_MODES.PICKUP ? "Pickup Fee" : "Estimated Delivery Fee"}</p>
            <p className="font-medium text-gray-800">{formatCurrency(estimatedDeliveryFee)}</p>
          </div>
          <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
            <p>Total</p>
            <p>{formatCurrency(totalAmount)}</p>
          </div>
          <p className="text-xs text-gray-500">
            Seller contact stays hidden until the seller accepts the order. Completed orders are confirmed inside the app.
          </p>
        </div>
      </div>

      <button
        onClick={createOrder}
        disabled={isPlacingOrder}
        className="w-full bg-orange-600 text-white py-3 mt-5 hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span className="flex items-center justify-center gap-2">
          {isPlacingOrder && (
            <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          )}
          {isPlacingOrder ? "Placing Order..." : "Place Order"}
        </span>
      </button>
    </div>
  );
};

export default OrderSummary;
