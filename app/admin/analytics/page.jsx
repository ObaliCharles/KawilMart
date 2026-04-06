'use client'
import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AnalyticsPageSkeleton } from '@/components/dashboard/DashboardSkeletons';

export default function AdminAnalytics() {
    const { getToken, user, authReady, formatCurrency, formatCompactCurrency } = useAppContext();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authReady && user) fetchStats();
    }, [authReady, user]);

    const fetchStats = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/admin/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) setStats(data.stats);
            else toast.error(data.message);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <AnalyticsPageSkeleton />;
    if (!stats) return <div className="text-center py-20 text-gray-400">No data available</div>;

    const maxRevenue = Math.max(...stats.revenueByDay.map(d => d.revenue), 1);
    const totalCategoryProducts = Object.values(stats.categoryBreakdown).reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-8 max-w-7xl">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <p className="text-sm text-gray-500 mt-1">Platform performance overview</p>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Avg Order Value', value: formatCurrency(stats.completedOrders ? stats.totalRevenue / stats.completedOrders : 0), icon: '💡' },
                    { label: 'Completion Rate', value: `${stats.totalOrders ? Math.round(((stats.completedOrders || 0) / stats.totalOrders) * 100) : 0}%`, icon: '✅' },
                    { label: 'Cancellation Rate', value: `${stats.totalOrders ? Math.round(((stats.cancelledOrders || 0) / stats.totalOrders) * 100) : 0}%`, icon: '❌' },
                    { label: 'Products/User Ratio', value: (stats.totalUsers ? (stats.totalProducts / stats.totalUsers).toFixed(1) : 0), icon: '📐' },
                ].map(kpi => (
                    <div key={kpi.label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                        <p className="text-2xl mb-1">{kpi.icon}</p>
                        <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Revenue Bar Chart */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="font-semibold text-gray-900 mb-2">Daily Revenue (Last 7 Days)</h2>
                    <p className="text-sm text-gray-400 mb-6">Total: {formatCurrency(stats.totalRevenue)}</p>
                    <div className="flex items-end gap-2 h-48">
                        {stats.revenueByDay.map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-xs text-gray-500">
                                    {day.revenue > 0 ? formatCompactCurrency(day.revenue) : ''}
                                </span>
                                <div className="w-full bg-gray-100 rounded-lg" style={{ height: '130px' }}>
                                    <div
                                        className="w-full bg-gradient-to-t from-orange-600 to-orange-300 rounded-lg transition-all duration-700"
                                        style={{ height: `${Math.max(3, (day.revenue / maxRevenue) * 100)}%`, marginTop: `${100 - Math.max(3, (day.revenue / maxRevenue) * 100)}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-400">{day.day}</span>
                                <span className="text-xs text-gray-300">{day.count} orders</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="font-semibold text-gray-900 mb-6">Products by Category</h2>
                    <div className="space-y-3">
                        {Object.entries(stats.categoryBreakdown)
                            .sort((a, b) => b[1] - a[1])
                            .map(([cat, count]) => (
                                <div key={cat}>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-gray-700 font-medium">{cat}</span>
                                        <span className="text-gray-500">{count} products ({Math.round((count / totalCategoryProducts) * 100)}%)</span>
                                    </div>
                                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500"
                                            style={{ width: `${(count / totalCategoryProducts) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Order Status Pie-style */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="font-semibold text-gray-900 mb-6">Order Status Distribution</h2>
                    <div className="space-y-3">
                        {Object.entries(stats.statusCounts).map(([status, count]) => {
                            const pct = Math.round((count / stats.totalOrders) * 100);
                            return (
                                <div key={status}>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-gray-700">{status}</span>
                                        <span className="text-gray-500">{count} ({pct}%)</span>
                                    </div>
                                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="font-semibold text-gray-900 mb-4">Platform Summary</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: '💰', bg: 'bg-green-50' },
                            { label: 'Total Orders', value: stats.totalOrders, icon: '📦', bg: 'bg-blue-50' },
                            { label: 'Total Products', value: stats.totalProducts, icon: '🛍️', bg: 'bg-purple-50' },
                            { label: 'Total Users', value: stats.totalUsers, icon: '👥', bg: 'bg-orange-50' },
                        ].map(item => (
                            <div key={item.label} className={`${item.bg} rounded-xl p-4`}>
                                <span className="text-2xl">{item.icon}</span>
                                <p className={`mt-1 font-bold text-gray-900 leading-tight ${item.label === 'Total Revenue' ? 'text-[15px] break-words sm:text-2xl' : 'text-xl sm:text-2xl'}`}>{item.value}</p>
                                <p className="text-xs text-gray-500">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
