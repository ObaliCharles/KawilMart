'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import { assets } from '@/assets/assets';

const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: '📊' },
    { name: 'All Orders', path: '/admin/orders', icon: '📦' },
    { name: 'Products', path: '/admin/products', icon: '🛍️' },
    { name: 'Users & Roles', path: '/admin/users', icon: '👥' },
    { name: 'Analytics', path: '/admin/analytics', icon: '📈' },
];

const AdminLayout = ({ children }) => {
    const pathname = usePathname();
    const { user, isSeller } = useAppContext();
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
                        {user?.firstName} {user?.lastName}
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
