"use client"
import React, { useState } from "react";
import { assets, BagIcon, BoxIcon, CartIcon, HomeIcon } from "@/assets/assets";
import Link from "next/link"
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { useClerk, UserButton, useUser } from "@clerk/nextjs";

const Navbar = () => {
  const { isSeller, router } = useAppContext();
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const [mobileSearch, setMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const role = user?.publicMetadata?.role;
  const isAdmin = role === 'admin';
  const isRider = role === 'rider';

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/all-products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setMobileSearch(false);
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700 bg-white sticky top-0 z-30">
      <Image
        className="cursor-pointer w-28 md:w-32"
        onClick={() => router.push('/')}
        src={assets.logo}
        alt="logo"
      />

      {/* Desktop Nav Links */}
      <div className="flex items-center gap-4 lg:gap-8 max-md:hidden">
        <Link href="/" className="hover:text-gray-900 transition text-sm">Home</Link>
        <Link href="/all-products" className="hover:text-gray-900 transition text-sm">Shop</Link>
        <Link href="/all-products?filter=flash" className="hover:text-orange-600 transition text-sm text-orange-500 font-medium">⚡ Deals</Link>
        <Link href="/" className="hover:text-gray-900 transition text-sm">About Us</Link>
        {(isSeller || isAdmin) && (
          <button onClick={() => router.push('/seller')} className="text-xs border px-4 py-1.5 rounded-full hover:bg-gray-50 transition">
            🏪 Seller
          </button>
        )}
        {isAdmin && (
          <button onClick={() => router.push('/admin')} className="text-xs border border-orange-400 text-orange-600 px-4 py-1.5 rounded-full hover:bg-orange-50 transition">
            🛡️ Admin
          </button>
        )}
        {isRider && (
          <button onClick={() => router.push('/dashboard/rider')} className="text-xs border border-purple-400 text-purple-600 px-4 py-1.5 rounded-full hover:bg-purple-50 transition">
            🛵 Deliveries
          </button>
        )}
      </div>

      {/* Desktop Right */}
      <div className="hidden md:flex items-center gap-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center border border-gray-200 rounded-full px-3 py-1.5 gap-2 hover:border-orange-400 transition">
          <Image className="w-4 h-4 opacity-50" src={assets.search_icon} alt="search icon" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="outline-none text-sm w-32 bg-transparent"
          />
        </form>
        {user
          ? (
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Action label="Cart" labelIcon={<CartIcon />} onClick={() => router.push('/cart')} />
              </UserButton.MenuItems>
              <UserButton.MenuItems>
                <UserButton.Action label="My Orders" labelIcon={<BagIcon />} onClick={() => router.push('/my-orders')} />
              </UserButton.MenuItems>
            </UserButton>
          )
          : (
            <button onClick={openSignIn} className="flex items-center gap-2 hover:text-gray-900 transition text-sm">
              <Image src={assets.user_icon} alt="user icon" />
              Account
            </button>
          )
        }
      </div>

      {/* Mobile Right */}
      <div className="flex items-center md:hidden gap-3">
        {isAdmin && (
          <button onClick={() => router.push('/admin')} className="text-xs border border-orange-400 text-orange-600 px-3 py-1 rounded-full">
            Admin
          </button>
        )}
        {isRider && (
          <button onClick={() => router.push('/dashboard/rider')} className="text-xs border border-purple-400 text-purple-600 px-3 py-1 rounded-full">
            Rider
          </button>
        )}
        {(isSeller || isAdmin) && (
          <button onClick={() => router.push('/seller')} className="text-xs border px-3 py-1 rounded-full">Seller</button>
        )}
        {user
          ? (
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Action label="Home" labelIcon={<HomeIcon />} onClick={() => router.push('/')} />
              </UserButton.MenuItems>
              <UserButton.MenuItems>
                <UserButton.Action label="Products" labelIcon={<BoxIcon />} onClick={() => router.push('/all-products')} />
              </UserButton.MenuItems>
              <UserButton.MenuItems>
                <UserButton.Action label="Cart" labelIcon={<CartIcon />} onClick={() => router.push('/cart')} />
              </UserButton.MenuItems>
              <UserButton.MenuItems>
                <UserButton.Action label="My Orders" labelIcon={<BagIcon />} onClick={() => router.push('/my-orders')} />
              </UserButton.MenuItems>
            </UserButton>
          )
          : (
            <button onClick={openSignIn} className="flex items-center gap-2 hover:text-gray-900 transition text-sm">
              <Image src={assets.user_icon} alt="user icon" />
              Account
            </button>
          )
        }
      </div>
    </nav>
  );
};

export default Navbar;
