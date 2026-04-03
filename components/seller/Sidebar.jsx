'use client'
import React from 'react';
import Link from 'next/link';
import { assets } from '../../assets/assets';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';

const SideBar = () => {
    const pathname = usePathname();
    const { isAdmin } = useAppContext();

    const menuItems = [
        { name: 'Add Product', path: '/seller', icon: assets.add_icon },
        { name: 'Product List', path: '/seller/product-list', icon: assets.product_list_icon },
        { name: 'Orders', path: '/seller/orders', icon: assets.order_icon },
    ];

    return (
        <div className='md:w-64 w-16 border-r min-h-screen text-base border-gray-300 py-2 flex flex-col'>
            {menuItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                    <Link href={item.path} key={item.name} passHref>
                        <div className={`flex items-center py-3 px-4 gap-3 ${
                            isActive
                                ? 'border-r-4 md:border-r-[6px] bg-orange-600/10 border-orange-500/90'
                                : 'hover:bg-gray-100/90 border-white'
                        }`}>
                            <Image
                                src={item.icon}
                                alt={`${item.name.toLowerCase()}_icon`}
                                className="w-7 h-7"
                            />
                            <p className='md:block hidden text-center'>{item.name}</p>
                        </div>
                    </Link>
                );
            })}

            {/* Admin shortcut — only visible to admins */}
            {isAdmin && (
                <Link href="/admin" passHref>
                    <div className={`flex items-center py-3 px-4 gap-3 mt-auto border-t border-gray-100 ${
                        pathname.startsWith('/admin')
                            ? 'border-r-4 md:border-r-[6px] bg-orange-600/10 border-orange-500/90'
                            : 'hover:bg-gray-100/90 border-white'
                    }`}>
                        <span className="text-xl w-7 h-7 flex items-center justify-center">🛡️</span>
                        <p className='md:block hidden text-center text-orange-600 font-medium'>Admin Panel</p>
                    </div>
                </Link>
            )}

            <Link href="/" passHref>
                <div className="flex items-center py-3 px-4 gap-3 hover:bg-gray-100/90 border-white mt-1">
                    <span className="text-xl w-7 h-7 flex items-center justify-center">🏠</span>
                    <p className='md:block hidden text-center text-gray-500'>Back to Store</p>
                </div>
            </Link>
        </div>
    );
};

export default SideBar;
