'use client'
import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import { assets } from '@/assets/assets';
import Link from 'next/link';
import { RiderDashboardSkeleton } from '@/components/dashboard/DashboardSkeletons';

const statusColors = {
    'Order Placed': { bg: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
    'Confirmed': { bg: 'bg-sky-100 text-sky-700', dot: 'bg-sky-500' },
    'Preparing': { bg: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
    'Processing': { bg: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
    'Ready for Delivery': { bg: 'bg-cyan-100 text-cyan-700', dot: 'bg-cyan-500' },
    'Shipped': { bg: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
    'Out for Delivery': { bg: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
    'Delivered': { bg: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
    'Cancelled': { bg: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

const stepIcons = ['📋', '⚙️', '📦', '🛵', '✅'];
const stepLabels = ['Assigned', 'Preparing', 'Pickup Ready', 'Out for Delivery', 'Delivered'];

const getStep = (status) => {
    const map = {
        'Order Placed': 0,
        'Confirmed': 0,
        'Preparing': 1,
        'Processing': 1,
        'Ready for Delivery': 2,
        'Shipped': 2,
        'Out for Delivery': 3,
        'Delivered': 4,
    };
    return map[status] ?? 0;
};

const getStatusHint = (status) => {
    if (status === 'Out for Delivery') {
        return 'Head to the drop-off point and confirm delivery once complete.';
    }

    if (status === 'Delivered') {
        return 'Completed delivery. Great work.';
    }

    if (status === 'Shipped' || status === 'Ready for Delivery') {
        return 'Pickup is ready. Collect the items and start the delivery trip.';
    }

    return 'Keep an eye on this order while the seller prepares it for pickup.';
};

const getDeliveryActionLabel = (status) => {
    if (status === 'Out for Delivery') {
        return 'Already on the road';
    }

    if (status === 'Delivered') {
        return 'Delivery completed';
    }

    return 'Mark Out for Delivery';
};

export default function RiderDashboard() {
    const { getToken, user, authReady, formatCurrency } = useAppContext();
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');
    const [updatingId, setUpdatingId] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        if (authReady && user) fetchDeliveries();
    }, [authReady, user]);

    const fetchDeliveries = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/rider/deliveries', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) setDeliveries(data.deliveries);
            else toast.error(data.message);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, status) => {
        setUpdatingId(orderId);
        try {
            const token = await getToken();
            const { data } = await axios.put('/api/rider/deliveries',
                { orderId, status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                setDeliveries(prev => prev.map(d => d._id === orderId ? { ...d, status } : d));
                toast.success(data.message);
                if (status === 'Delivered') setExpandedId(null);
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setUpdatingId(null);
        }
    };

    const active = deliveries.filter(d => d.status !== 'Delivered');
    const completed = deliveries.filter(d => d.status === 'Delivered');
    const displayed = activeTab === 'active' ? active : completed;

    const readyForPickup = active.filter((delivery) => delivery.status !== 'Out for Delivery').length;
    const onTheRoad = active.filter((delivery) => delivery.status === 'Out for Delivery').length;
    const totalDelivered = completed.length;
    const totalEarnings = completed.reduce((sum, d) => sum + (d.estimatedCommission || 0), 0);

    if (loading) return (
        <>
            <Navbar />
            <RiderDashboardSkeleton />
        </>
    );

    return (
        <>
            <Navbar />
            <div className="px-4 md:px-10 lg:px-20 py-8 min-h-screen bg-gray-50">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-orange-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">🛵 RIDER</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Delivery Dashboard</h1>
                        <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.firstName}!</p>
                    </div>
                    <Link href="/">
                        <div className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
                            <Image src={assets.logo} alt="logo" className="w-20" />
                        </div>
                    </Link>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { icon: '📍', label: 'Ready for Pickup', value: readyForPickup, bg: 'bg-cyan-50' },
                        { icon: '🛵', label: 'On the Road', value: onTheRoad, bg: 'bg-orange-50' },
                        { icon: '✅', label: 'Delivered', value: totalDelivered, bg: 'bg-green-50' },
                        { icon: '💰', label: 'Est. Earnings', value: formatCurrency(totalEarnings), bg: 'bg-purple-50' },
                    ].map(s => (
                        <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-white shadow-sm`}>
                            <span className="text-2xl">{s.icon}</span>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
                            <p className="text-xs text-gray-500">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition ${
                            activeTab === 'active'
                                ? 'bg-orange-600 text-white shadow-sm'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        🛵 Active ({active.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition ${
                            activeTab === 'completed'
                                ? 'bg-green-600 text-white shadow-sm'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        ✅ Completed ({completed.length})
                    </button>
                </div>

                {/* Delivery Cards */}
                {displayed.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400 bg-white rounded-2xl border border-gray-100">
                        <span className="text-5xl mb-3">{activeTab === 'active' ? '🛵' : '✅'}</span>
                        <p className="font-medium">{activeTab === 'active' ? 'No active deliveries' : 'No completed deliveries yet'}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayed.map(delivery => {
                            const step = getStep(delivery.status);
                            const isExpanded = expandedId === delivery._id;
                            const sc = statusColors[delivery.status] || { bg: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' };

                            return (
                                <div key={delivery._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    {/* Card Header */}
                                    <div
                                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/50"
                                        onClick={() => setExpandedId(isExpanded ? null : delivery._id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${sc.bg}`}>
                                                {stepIcons[step]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">
                                                    Order #{String(delivery._id).slice(-8).toUpperCase()}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {delivery.totalItems || delivery.items.length} item(s) · {formatCurrency(delivery.amount)}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Pickup: {delivery.pickup?.location || 'Awaiting seller location'} → Drop-off: {delivery.dropoff?.location || 'Awaiting customer address'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${sc.bg}`}>
                                                {delivery.status}
                                            </span>
                                            <span className="text-gray-400">{isExpanded ? '▲' : '▼'}</span>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-100 p-5 space-y-5">
                                            {/* Progress Steps */}
                                            <div>
                                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Delivery Progress</p>
                                                <div className="flex items-center">
                                                    {stepLabels.map((label, i) => (
                                                        <React.Fragment key={label}>
                                                            <div className="flex flex-col items-center gap-1">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                                                    i <= step ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-400'
                                                                }`}>
                                                                    {stepIcons[i]}
                                                                </div>
                                                                <span className="text-xs text-gray-500 whitespace-nowrap hidden sm:block">{label}</span>
                                                            </div>
                                                            {i < stepLabels.length - 1 && (
                                                                <div className={`flex-1 h-0.5 mx-1 ${i < step ? 'bg-orange-600' : 'bg-gray-200'}`} />
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                                <p className="mt-3 text-sm text-gray-500">{getStatusHint(delivery.status)}</p>
                                            </div>

                                            <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_1.15fr_0.9fr] gap-5">
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Pickup Details</p>
                                                        <div className="p-4 bg-slate-50 rounded-2xl text-sm text-gray-700 space-y-2 border border-slate-100">
                                                            <p className="font-semibold text-gray-900">{delivery.seller?.name || 'Seller'}</p>
                                                            <p>Pickup base: {delivery.pickup?.location || 'Pickup location not available yet'}</p>
                                                            {delivery.pickup?.stops?.length > 0 && (
                                                                <div>
                                                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Item pickup points</p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {delivery.pickup.stops.map((stop) => (
                                                                            <span key={stop} className="rounded-full bg-white px-3 py-1 text-xs text-gray-600 border border-gray-200">
                                                                                {stop}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {delivery.pickup?.phoneNumber && (
                                                                <a
                                                                    href={`tel:${delivery.pickup.phoneNumber}`}
                                                                    className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-700 transition"
                                                                >
                                                                    Call seller: {delivery.pickup.phoneNumber}
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Items</p>
                                                        <div className="space-y-2">
                                                            {delivery.items.map((item, i) => (
                                                                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                                    {item.product?.image?.[0] && (
                                                                        <Image
                                                                            src={item.product.image[0]}
                                                                            alt={item.product.name}
                                                                            width={48}
                                                                            height={48}
                                                                            className="rounded-lg object-cover w-12 h-12"
                                                                        />
                                                                    )}
                                                                    <div className="min-w-0">
                                                                        <p className="text-sm font-medium text-gray-800 truncate">{item.product?.name || 'Product'}</p>
                                                                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                                        {item.product?.location && (
                                                                            <p className="text-xs text-gray-400">Item location: {item.product.location}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Items */}
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Drop-off Details</p>
                                                    {delivery.dropoff?.location ? (
                                                        <div className="p-4 bg-gray-50 rounded-2xl text-sm text-gray-700 space-y-2 border border-gray-100">
                                                            <p className="font-semibold text-gray-900">{delivery.dropoff.customerName || 'Customer'}</p>
                                                            <p>{delivery.dropoff.location}</p>
                                                            <p className="text-gray-500">
                                                                {delivery.dropoff.area}
                                                                {delivery.dropoff.area && (delivery.dropoff.city || delivery.dropoff.state) ? ' • ' : ''}
                                                                {[delivery.dropoff.city, delivery.dropoff.state].filter(Boolean).join(', ')}
                                                            </p>
                                                            {delivery.dropoff.phoneNumber && (
                                                                <a
                                                                    href={`tel:${delivery.dropoff.phoneNumber}`}
                                                                    className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black transition"
                                                                >
                                                                    Call customer: {delivery.dropoff.phoneNumber}
                                                                </a>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-400">No address available</p>
                                                    )}
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Trip Snapshot</p>
                                                        <div className="p-4 bg-gray-50 rounded-2xl text-sm text-gray-600 space-y-2 border border-gray-100">
                                                            <p>📅 {new Date(delivery.date).toLocaleDateString()}</p>
                                                            <p className="font-semibold text-gray-800">
                                                                💰 Order total: {formatCurrency(delivery.amount)}
                                                            </p>
                                                            <p className="text-green-600 font-medium">
                                                                🎁 Your commission: {formatCurrency(delivery.estimatedCommission || 0)}
                                                            </p>
                                                            <p>📦 Items to carry: {delivery.totalItems || delivery.items.length}</p>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Contacts</p>
                                                        <div className="p-4 bg-gray-50 rounded-2xl text-sm text-gray-700 space-y-3 border border-gray-100">
                                                            <div>
                                                                <p className="text-xs uppercase tracking-wide text-gray-400">Seller</p>
                                                                <p className="font-medium text-gray-900">{delivery.seller?.name || 'Seller'}</p>
                                                                <p>{delivery.pickup?.phoneNumber || 'No phone available'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs uppercase tracking-wide text-gray-400">Customer</p>
                                                                <p className="font-medium text-gray-900">{delivery.dropoff?.customerName || 'Customer'}</p>
                                                                <p>{delivery.dropoff?.phoneNumber || 'No phone available'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            {delivery.status !== 'Delivered' && (
                                                <div className="flex gap-3 pt-2">
                                                    {delivery.status !== 'Out for Delivery' && (
                                                        <button
                                                            onClick={() => updateStatus(delivery._id, 'Out for Delivery')}
                                                            disabled={updatingId === delivery._id}
                                                            className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-semibold text-sm hover:bg-orange-700 transition disabled:opacity-50"
                                                        >
                                                            {updatingId === delivery._id ? 'Saving...' : `🛵 ${getDeliveryActionLabel(delivery.status)}`}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => updateStatus(delivery._id, 'Delivered')}
                                                        disabled={updatingId === delivery._id}
                                                        className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition disabled:opacity-50"
                                                    >
                                                        {updatingId === delivery._id ? 'Saving...' : '✅ Mark Delivered'}
                                                    </button>
                                                </div>
                                            )}

                                            {delivery.status === 'Delivered' && (
                                                <div className="flex items-center gap-2 py-3 px-4 bg-green-50 rounded-xl text-green-700 text-sm font-medium">
                                                    ✅ This delivery has been completed successfully!
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
