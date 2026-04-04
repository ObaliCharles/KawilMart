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
    'Processing': { bg: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
    'Shipped': { bg: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
    'Out for Delivery': { bg: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
    'Delivered': { bg: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
};

const stepIcons = ['📋', '⚙️', '📦', '🛵', '✅'];
const stepLabels = ['Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

const getStep = (status) => {
    const map = { 'Order Placed': 0, 'Processing': 1, 'Shipped': 2, 'Out for Delivery': 3, 'Delivered': 4 };
    return map[status] ?? 0;
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

    const totalDelivered = completed.length;
    const totalEarnings = completed.reduce((sum, d) => sum + (d.amount || 0) * 0.05, 0); // 5% commission

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
                        { icon: '🛵', label: 'Active Deliveries', value: active.length, bg: 'bg-orange-50' },
                        { icon: '✅', label: 'Delivered', value: totalDelivered, bg: 'bg-green-50' },
                        { icon: '📦', label: 'Total Assigned', value: deliveries.length, bg: 'bg-blue-50' },
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
                                                    {delivery.items.length} item(s) · {formatCurrency(delivery.amount)}
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
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                {/* Items */}
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Items</p>
                                                    <div className="space-y-2">
                                                        {delivery.items.map((item, i) => (
                                                            <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                                                {item.product?.image?.[0] && (
                                                                    <Image
                                                                        src={item.product.image[0]}
                                                                        alt={item.product.name}
                                                                        width={40}
                                                                        height={40}
                                                                        className="rounded-lg object-cover w-10 h-10"
                                                                    />
                                                                )}
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-800">{item.product?.name || 'Product'}</p>
                                                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Delivery Address */}
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Delivery Address</p>
                                                    {delivery.address ? (
                                                        <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700 space-y-1">
                                                            <p className="font-semibold">{delivery.address.fullName}</p>
                                                            <p>{delivery.address.area}</p>
                                                            <p>{delivery.address.city}, {delivery.address.state}</p>
                                                            <p className="text-orange-600 font-medium">📞 {delivery.address.phoneNumber}</p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-400">No address available</p>
                                                    )}

                                                    {/* Order Info */}
                                                    <div className="mt-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-600 space-y-1">
                                                        <p>📅 {new Date(delivery.date).toLocaleDateString()}</p>
                                                        <p className="font-semibold text-gray-800">
                                                            💰 Total: {formatCurrency(delivery.amount)}
                                                        </p>
                                                        <p className="text-green-600 font-medium">
                                                            🎁 Your commission: {formatCurrency((delivery.amount || 0) * 0.05)}
                                                        </p>
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
                                                            🛵 Mark Out for Delivery
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => updateStatus(delivery._id, 'Delivered')}
                                                        disabled={updatingId === delivery._id}
                                                        className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition disabled:opacity-50"
                                                    >
                                                        ✅ Mark Delivered
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
