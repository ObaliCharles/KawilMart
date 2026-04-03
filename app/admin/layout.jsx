'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { UserButton, useAuth, useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { assets } from '@/assets/assets';
import axios from 'axios';
import toast from 'react-hot-toast';

const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: '📊' },
    { name: 'All Orders', path: '/admin/orders', icon: '📦' },
    { name: 'Products', path: '/admin/products', icon: '🛍️' },
    { name: 'Users & Roles', path: '/admin/users', icon: '👥' },
    { name: 'Management', path: '/admin/management', icon: '⚙️' },
    { name: 'Promotions', path: '/admin/promotions', icon: '🎯' },
    { name: 'Analytics', path: '/admin/analytics', icon: '📈' },
];

const AdminLayout = ({ children }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { user: contextUser } = useAppContext();
    const { sessionClaims, isLoaded: isAuthLoaded, getToken } = useAuth();
    const { user, isLoaded: isUserLoaded } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const isLoaded = isAuthLoaded && isUserLoaded;

    const role = user?.publicMetadata?.role || sessionClaims?.publicMetadata?.role || sessionClaims?.metadata?.role;
    const hasAdminAccess = role === 'admin';

    useEffect(() => {
        console.log('Admin Layout Debug:', { isLoaded, sessionClaims, role, userEmail: user?.emailAddresses?.[0]?.emailAddress });
        if (isLoaded && !hasAdminAccess) {
            console.log('Redirecting from admin - no access');
            router.replace('/');
        } else {
            console.log('Admin access granted');
        }
    }, [hasAdminAccess, isLoaded, role, router, sessionClaims, user]);

    if (!isLoaded) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!hasAdminAccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h1>
                    <p className="text-gray-600 mb-6">
                        You need admin privileges to access this area.
                        {role && <span className="block mt-2 text-sm">Current role: <strong>{role}</strong></span>}
                    </p>
                    <button
                        onClick={async () => {
                            try {
                                const token = await getToken();
                                const { data } = await axios.post('/api/admin/set-admin', {}, {
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                                if (data.success) {
                                    toast.success(data.message);
                                    window.location.reload();
                                } else {
                                    toast.error(data.message);
                                }
                            } catch (err) {
                                toast.error('Failed to set admin role');
                            }
                        }}
                        className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition font-medium"
                    >
                        Set Myself as Admin
                    </button>
                    <p className="text-xs text-gray-500 mt-4">
                        This will grant you admin access to the system.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Navbar */}
            <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between z-20 sticky top-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                    >
                        <span className="text-xl">☰</span>
                    </button>
                    <Image
                        src={assets.logo}
                        alt="KawilMart"
                        className="w-24 cursor-pointer"
                        onClick={() => window.location.href = '/'}
                    />
                    <span className="hidden md:inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-full ml-2">
                        🛡️ ADMIN
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="hidden md:block text-sm text-gray-600">
                        {contextUser?.firstName} {contextUser?.lastName}
                    </span>
                    <UserButton />
                </div>
            </header>

            <div className="flex flex-1 relative">
                {/* Mobile overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/40 z-30 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside className={`
                    fixed md:sticky top-0 md:top-[57px] left-0 h-full md:h-[calc(100vh-57px)]
                    w-60 bg-white border-r border-gray-200 flex flex-col z-40
                    transition-transform duration-300
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}>
                    <nav className="flex-1 py-4 overflow-y-auto">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <Link href={item.path} key={item.name} onClick={() => setSidebarOpen(false)}>
                                    <div className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl mb-1 transition-all ${
                                        isActive
                                            ? 'bg-orange-600 text-white font-semibold shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}>
                                        <span className="text-xl">{item.icon}</span>
                                        <span className="text-sm">{item.name}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom links */}
                    <div className="p-4 border-t border-gray-100 space-y-1">
                        <Link href="/seller">
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-100 text-sm">
                                <span>🏪</span> Seller Dashboard
                            </div>
                        </Link>
                        <Link href="/">
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-100 text-sm">
                                <span>🏠</span> Back to Store
                            </div>
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-8 overflow-x-hidden min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
