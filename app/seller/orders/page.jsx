'use client';
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import axios from "axios";
import toast from "react-hot-toast";
import { OrdersManagementPageSkeleton } from "@/components/dashboard/DashboardSkeletons";

const statusColors = {
    'Order Placed': 'bg-blue-100 text-blue-700',
    'Confirmed': 'bg-sky-100 text-sky-700',
    'Preparing': 'bg-amber-100 text-amber-700',
    'Processing': 'bg-yellow-100 text-yellow-700',
    'Ready for Delivery': 'bg-cyan-100 text-cyan-700',
    'Shipped': 'bg-purple-100 text-purple-700',
    'Out for Delivery': 'bg-indigo-100 text-indigo-700',
    'Delivered': 'bg-green-100 text-green-700',
    'Cancelled': 'bg-red-100 text-red-700',
};

const paymentStatusColors = {
    Pending: 'bg-amber-100 text-amber-700',
    Paid: 'bg-green-100 text-green-700',
    Failed: 'bg-red-100 text-red-700',
};

const paymentStatusOptions = ['Pending', 'Paid', 'Failed'];

const Orders = () => {
    const { getToken, user, authReady, formatCurrency } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [riders, setRiders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingState, setUpdatingState] = useState({ orderId: null, field: '' });

    const fetchSellerOrders = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/order/seller-orders', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                setOrders(data.orders || []);
                setRiders(data.riders || []);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateOrder = async (orderId, updates, field) => {
        setUpdatingState({ orderId, field });

        try {
            const token = await getToken();
            const { data } = await axios.put(
                '/api/order/seller-orders',
                { orderId, ...updates },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                setOrders((prevOrders) => prevOrders.map((order) => (
                    order._id === orderId
                        ? {
                            ...order,
                            riderId: data.order?.riderId || null,
                            paymentStatus: data.order?.paymentStatus || 'Pending',
                            trackingEvents: data.order?.trackingEvents || order.trackingEvents,
                        }
                        : order
                )));
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message || 'Failed to update order');
        } finally {
            setUpdatingState({ orderId: null, field: '' });
        }
    };

    const updateOrderRider = async (orderId, riderId) => {
        await updateOrder(orderId, { riderId }, 'rider');
    };

    const updatePaymentStatus = async (orderId, paymentStatus) => {
        await updateOrder(orderId, { paymentStatus }, 'payment');
    };

    useEffect(() => {
        if (authReady && user) fetchSellerOrders();
    }, [authReady, user]);

    return (
        <div className="flex min-h-screen flex-1 flex-col justify-between text-sm">
            {loading ? <div className="md:p-10 p-4"><OrdersManagementPageSkeleton /></div> : (
                <div className="md:p-10 p-4 space-y-5">
                    <div>
                        <h2 className="text-lg font-medium">Orders</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Assign riders and manage payment statuses directly from your seller dashboard.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                        {orders.length === 0 ? (
                            <div className="p-10 text-center text-gray-400">
                                No orders yet
                            </div>
                        ) : orders.map((order) => {
                            const isUpdatingOrder = updatingState.orderId === order._id;
                            const isUpdatingRider = isUpdatingOrder && updatingState.field === 'rider';
                            const isUpdatingPayment = isUpdatingOrder && updatingState.field === 'payment';

                            return (
                            <div
                                key={order._id}
                                className="grid grid-cols-1 gap-4 border-t border-gray-100 p-4 first:border-t-0 sm:p-5 xl:grid-cols-[1.5fr_1.1fr_0.75fr_0.9fr_1.05fr_0.75fr] xl:gap-5"
                            >
                                <div className="flex min-w-0 gap-3 sm:gap-4">
                                    <Image
                                        className="h-14 w-14 shrink-0 object-cover sm:h-16 sm:w-16"
                                        src={assets.box_icon}
                                        alt="box_icon"
                                        width={64}
                                        height={64}
                                    />
                                    <div className="min-w-0 space-y-2">
                                        <p className="font-medium text-gray-900 break-words">
                                            {order.items.map(item => `${item.product?.name || 'Deleted Product'} x ${item.quantity}`).join(", ")}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Order #{String(order._id).slice(-8).toUpperCase()}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Items: {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-sm text-gray-600">
                                    <p className="font-medium text-gray-800">{order.address?.fullName || 'No name'}</p>
                                    <p>{order.address?.area || 'No area'}</p>
                                    <p>{order.address ? `${order.address.city}, ${order.address.state}` : 'No city'}</p>
                                    <p>{order.address?.phoneNumber || 'No phone'}</p>
                                </div>

                                <div className="font-medium text-gray-800">
                                    {formatCurrency(order.amount)}
                                </div>

                                <div className="text-sm text-gray-500">
                                    <p>Method: COD</p>
                                    <p>Date: {new Date(order.date).toLocaleDateString()}</p>
                                    <div className="mt-3 space-y-2">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Payment Status
                                        </p>
                                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${paymentStatusColors[order.paymentStatus || 'Pending'] || 'bg-gray-100 text-gray-600'}`}>
                                            {order.paymentStatus || 'Pending'}
                                        </span>
                                        <select
                                            value={order.paymentStatus || 'Pending'}
                                            disabled={isUpdatingOrder}
                                            onChange={(e) => updatePaymentStatus(order._id, e.target.value)}
                                            className="w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none"
                                        >
                                            {paymentStatusOptions.map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                        {isUpdatingPayment && (
                                            <p className="text-xs text-amber-600">Saving payment status...</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Assign Rider
                                    </p>
                                    <select
                                        value={order.riderId || ''}
                                        disabled={isUpdatingOrder}
                                        onChange={(e) => updateOrderRider(order._id, e.target.value)}
                                        className="w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
                                    >
                                        <option value="">Unassigned</option>
                                        {riders.map((rider) => (
                                            <option key={rider.id} value={rider.id}>
                                                {rider.name}
                                            </option>
                                        ))}
                                    </select>
                                    {isUpdatingRider ? (
                                        <p className="text-xs text-amber-600">
                                            Saving rider assignment...
                                        </p>
                                    ) : order.riderId ? (
                                        <p className="text-xs text-gray-500">
                                            Assigned
                                        </p>
                                    ) : null}
                                </div>

                                <div className="flex items-start xl:justify-end">
                                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
};

export default Orders;
