'use client';
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import axios from "axios";
import toast from "react-hot-toast";
import { OrdersPageSkeleton } from "@/components/PageSkeletons";
import { CUSTOMER_TRACKING_STEPS, getCustomerTrackingStepIndex } from "@/lib/orderTracking";

const statusColors = {
    'Order Placed': 'bg-blue-100 text-blue-700',
    'Confirmed': 'bg-sky-100 text-sky-700',
    'Preparing': 'bg-amber-100 text-amber-700',
    'Processing': 'bg-yellow-100 text-yellow-700',
    'Ready for Delivery': 'bg-cyan-100 text-cyan-700',
    'Shipped': 'bg-purple-100 text-purple-700',
    'Out for Delivery': 'bg-orange-100 text-orange-700',
    'Delivered': 'bg-green-100 text-green-700',
    'Cancelled': 'bg-red-100 text-red-700',
};

const isOrderActive = (status) => !['Delivered', 'Cancelled'].includes(status);

const MyOrders = () => {
    const { getToken, user, authReady, formatCurrency } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = async ({ silent = false, background = false } = {}) => {
        try {
            if (background) {
                setRefreshing(true);
            }

            const token = await getToken();
            const { data } = await axios.get('/api/order/list', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                setOrders(data.orders || []);
            } else if (!silent) {
                toast.error(data.message);
            }
        } catch (error) {
            if (!silent) {
                toast.error(error.message);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (authReady && user) {
            void fetchOrders();
        }
        // Initial order hydration follows auth state.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authReady, user]);

    const hasActiveOrders = orders.some((order) => isOrderActive(order.status));
    const activeOrdersCount = orders.filter((order) => isOrderActive(order.status)).length;

    useEffect(() => {
        if (!authReady || !user || !hasActiveOrders) {
            return undefined;
        }

        const interval = window.setInterval(() => {
            void fetchOrders({ silent: true, background: true });
        }, 20000);

        return () => window.clearInterval(interval);
        // Active order polling should restart only when the active-state set changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authReady, user, hasActiveOrders]);

    return (
        <>
            <Navbar />
            <div className="flex flex-col justify-between px-6 md:px-16 lg:px-32 py-6 min-h-screen">
                <div className="space-y-5">
                    <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900">My Orders</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Track the latest status of your orders from placement to delivery.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {activeOrdersCount > 0 && (
                                <span className="rounded-full bg-orange-50 px-3 py-2 text-xs font-medium text-orange-700">
                                    Auto-refreshing {activeOrdersCount} active order{activeOrdersCount === 1 ? '' : 's'} every 20s
                                </span>
                            )}
                            <button
                                onClick={() => void fetchOrders({ background: true })}
                                disabled={refreshing}
                                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                                    refreshing
                                        ? 'cursor-wait border-gray-200 text-gray-400'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {refreshing ? 'Refreshing...' : 'Refresh tracking'}
                            </button>
                        </div>
                    </div>

                    {loading ? <OrdersPageSkeleton titleWidth="w-32" /> : (
                        <div className="space-y-6 max-w-6xl">
                            {orders.length === 0 ? (
                                <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-400">
                                    No orders yet
                                </div>
                            ) : orders.map((order) => {
                                const currentStep = getCustomerTrackingStepIndex(order.status);
                                const latestTrackingEvent = order.trackingEvents?.[order.trackingEvents.length - 1];
                                const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

                                return (
                                    <div key={order._id} className="rounded-3xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm">
                                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        Order #{String(order._id).slice(-8).toUpperCase()}
                                                    </h3>
                                                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    Placed on {new Date(order.date).toLocaleString()}
                                                </p>
                                                {latestTrackingEvent?.timestamp && (
                                                    <p className="text-xs text-gray-400">
                                                        Last tracking update: {new Date(latestTrackingEvent.timestamp).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                                                <p className="font-semibold text-gray-900">{formatCurrency(order.amount)}</p>
                                                <p>{totalItems} item{totalItems === 1 ? '' : 's'}</p>
                                                <p>Payment: {order.paymentStatus}</p>
                                            </div>
                                        </div>

                                        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-5">
                                            {CUSTOMER_TRACKING_STEPS.map((step, index) => {
                                                const complete = index <= currentStep && order.status !== 'Cancelled';
                                                const isCurrent = index === currentStep && order.status !== 'Cancelled';

                                                return (
                                                    <div key={step.label} className="flex flex-col items-center gap-2 text-center">
                                                        <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                                                            order.status === 'Cancelled'
                                                                ? 'bg-red-100 text-red-600'
                                                                : complete
                                                                    ? 'bg-orange-600 text-white'
                                                                    : 'bg-gray-100 text-gray-400'
                                                        }`}>
                                                            {index + 1}
                                                        </div>
                                                        <p className={`text-xs ${
                                                            isCurrent ? 'font-semibold text-gray-900' : 'text-gray-500'
                                                        }`}>
                                                            {step.label}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-6 grid grid-cols-1 xl:grid-cols-[1.2fr_1fr_0.9fr_1fr] gap-5">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Items</p>
                                                <div className="space-y-2">
                                                    {order.items.map((item, index) => (
                                                        <div key={`${order._id}-${index}`} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3">
                                                            {item.product?.image?.[0] ? (
                                                                <Image
                                                                    src={item.product.image[0]}
                                                                    alt={item.product.name}
                                                                    width={48}
                                                                    height={48}
                                                                    className="h-12 w-12 rounded-xl object-cover"
                                                                />
                                                            ) : (
                                                                <div className="h-12 w-12 rounded-xl bg-gray-200" />
                                                            )}
                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-medium text-gray-900">{item.product?.name || 'Deleted Product'}</p>
                                                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                                {item.product?.location && (
                                                                    <p className="text-xs text-gray-400">From: {item.product.location}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Delivery Address</p>
                                                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700 space-y-2">
                                                    <p className="font-semibold text-gray-900">{order.address?.fullName || 'No address'}</p>
                                                    <p>{order.address?.area || ''}</p>
                                                    <p>{[order.address?.city, order.address?.state].filter(Boolean).join(', ')}</p>
                                                    <p>{order.address?.phoneNumber || order.customerPhone || ''}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Delivery Team</p>
                                                <div className="space-y-3">
                                                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
                                                        <p className="text-xs uppercase tracking-wide text-gray-400">Seller</p>
                                                        <p className="mt-1 font-semibold text-gray-900">{order.seller?.name || 'Seller'}</p>
                                                        <p>{order.seller?.location || 'Location not available'}</p>
                                                        <p>{order.seller?.phoneNumber || 'Phone not available'}</p>
                                                    </div>
                                                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
                                                        <p className="text-xs uppercase tracking-wide text-gray-400">Rider</p>
                                                        <p className="mt-1 font-semibold text-gray-900">{order.rider?.name || 'Not assigned yet'}</p>
                                                        <p>{order.rider?.phoneNumber || 'Assignment pending'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Tracking Timeline</p>
                                                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                                    <div className="space-y-4">
                                                        {(order.trackingEvents || []).slice().reverse().map((event) => (
                                                            <div key={event.id} className="relative pl-5">
                                                                <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-orange-500" />
                                                                <p className="text-sm font-semibold text-gray-900">{event.title}</p>
                                                                <p className="text-sm text-gray-600">{event.description}</p>
                                                                <p className="text-xs text-gray-400 mt-1">
                                                                    {event.timestamp ? new Date(event.timestamp).toLocaleString() : 'Just now'}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default MyOrders;
