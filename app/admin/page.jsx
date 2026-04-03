'use client'
import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import Loading from '@/components/Loading';

const StatCard = ({ icon, label, value, sub, color }) => (
    <div className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4`}>
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

const statusColors = {
    'Order Placed': 'bg-blue-100 text-blue-700',
    'Processing': 'bg-yellow-100 text-yellow-700',
    'Shipped': 'bg-purple-100 text-purple-700',
    'Delivered': 'bg-green-100 text-green-700',
    'Cancelled': 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
    const { getToken, user, currency } = useAppContext();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchStats();
    }, [user]);

    const fetchStats = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/admin/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setStats(data.stats);
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;
    if (!stats) return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <span className="text-5xl mb-4">🔒</span>
            <p className="text-xl font-semibold">Admin Access Required</p>
            <p className="text-sm mt-2">Your account needs the admin role to view this page.</p>
        </div>
    );

    const maxRevenue = Math.max(...stats.revenueByDay.map(d => d.revenue), 1);

    return (
        <div className="space-y-8 max-w-7xl">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.firstName}. Here's what's happening today.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon="💰"
                    label="Total Revenue"
                    value={`${currency}${stats.totalRevenue.toLocaleString()}`}
                    sub="All time earnings"
                    color="bg-green-50"
                />
                <StatCard
                    icon="📦"
                    label="Total Orders"
                    value={stats.totalOrders.toLocaleString()}
                    sub={`${stats.statusCounts['Order Placed'] || 0} pending`}
                    color="bg-blue-50"
                />
                <StatCard
                    icon="🛍️"
                    label="Products"
                    value={stats.totalProducts.toLocaleString()}
                    sub="Listed in store"
                    color="bg-purple-50"
                />
                <StatCard
                    icon="👥"
                    label="Users"
                    value={stats.totalUsers.toLocaleString()}
                    sub="Registered accounts"
                    color="bg-orange-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="font-semibold text-gray-900 mb-6">Revenue (Last 7 Days)</h2>
                    <div className="flex items-end gap-3 h-40">
                        {stats.revenueByDay.map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-xs text-gray-500 font-medium">
                                    {currency}{day.revenue > 999 ? `${(day.revenue/1000).toFixed(1)}k` : day.revenue}
                                </span>
                                <div className="w-full bg-gray-100 rounded-t-lg overflow-hidden flex flex-col justify-end" style={{ height: '100px' }}>
                                    <div
                                        className="w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-lg transition-all duration-500"
                                        style={{ height: `${Math.max(4, (day.revenue / maxRevenue) * 100)}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-400">{day.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Status Breakdown */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="font-semibold text-gray-900 mb-4">Order Status</h2>
                    <div className="space-y-3">
                        {Object.entries(stats.statusCounts).map(([status, count]) => (
                            <div key={status} className="flex items-center justify-between">
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-600'}`}>
                                    {status}
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-orange-500 rounded-full"
                                            style={{ width: `${(count / stats.totalOrders) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-bold text-gray-700 w-6 text-right">{count}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Category Breakdown */}
                    <h2 className="font-semibold text-gray-900 mt-6 mb-4">Products by Category</h2>
                    <div className="space-y-2">
                        {Object.entries(stats.categoryBreakdown).slice(0, 5).map(([cat, count]) => (
                            <div key={cat} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{cat}</span>
                                <span className="font-semibold text-gray-800">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 flex items-center justify-between border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">Recent Orders</h2>
                    <a href="/admin/orders" className="text-orange-600 text-sm hover:underline">View all →</a>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left px-6 py-3 text-gray-500 font-medium">Order ID</th>
                                <th className="text-left px-6 py-3 text-gray-500 font-medium">Amount</th>
                                <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                                <th className="text-left px-6 py-3 text-gray-500 font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentOrders.map((order, i) => (
                                <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                        #{String(order._id).slice(-8).toUpperCase()}
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-gray-800">
                                        {currency}{(order.amount || 0).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(order.date).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
