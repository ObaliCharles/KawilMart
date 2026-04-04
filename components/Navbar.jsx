"use client"
import React, { useEffect, useState } from "react";
import { assets, BagIcon, BoxIcon, CartIcon, HomeIcon } from "@/assets/assets";
import Link from "next/link"
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { useClerk, UserButton, useUser, useAuth } from "@clerk/nextjs";
import axios from 'axios';
import { NavbarUserSkeleton } from "@/components/dashboard/DashboardSkeletons";
import { usePathname } from "next/navigation";

const userButtonAppearance = {
  elements: {
    avatarBox: "h-10 w-10 rounded-full ring-2 ring-orange-200 shadow-sm overflow-hidden",
    userButtonTrigger: "focus:shadow-none",
  },
};

const Navbar = () => {
  const { isSeller, isAdmin, isRider, navigate, prefetchRoute, resolvedRole, setIsRouteLoading } = useAppContext();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { isLoaded: isAuthLoaded, getToken } = useAuth();
  const { openSignIn } = useClerk();
  const pathname = usePathname();
  const [mobileSearch, setMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const clerkReady = isUserLoaded && isAuthLoaded;

  // Check both context values and user metadata for roles
  const userRole = resolvedRole || user?.publicMetadata?.role;
  const showAdmin = isAdmin || userRole === 'admin';
  const showRider = isRider || userRole === 'rider';
  const showSeller = isSeller || userRole === 'seller' || userRole === 'admin';
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/all-products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setMobileSearch(false);
    }
  };

  useEffect(() => {
    if (!clerkReady) {
      return;
    }

    if (!user) {
      setUnreadCount(0);
      return;
    }

    let timeoutId;
    let idleId;

    const fetchNotifications = async () => {
      try {
        const token = await getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const { data } = await axios.get('/api/user/notifications', {
          headers
        });
        if (data.success) {
          setUnreadCount(data.notifications.filter(n => !n.read).length);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    const scheduleFetch = () => {
      void fetchNotifications();
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(scheduleFetch, { timeout: 1200 });
    } else {
      timeoutId = window.setTimeout(scheduleFetch, 400);
    }

    return () => {
      if (idleId && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [clerkReady, getToken, user]);

  useEffect(() => {
    const routes = ['/', '/all-products', '/cart', '/my-orders', '/notifications'];
    if (showSeller) routes.push('/seller');
    if (showAdmin) routes.push('/admin');
    if (showRider) routes.push('/dashboard/rider');

    routes.forEach((route) => {
      prefetchRoute(route);
    });
  }, [prefetchRoute, showAdmin, showRider, showSeller]);

  const beginLinkNavigation = (href) => {
    if (href !== pathname) {
      setIsRouteLoading(true);
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700 bg-white sticky top-0 z-30">
      <Link href="/" prefetch className="block" onClick={() => beginLinkNavigation("/")}>
        <Image
          className="cursor-pointer w-28 md:w-32"
          src={assets.logo}
          alt="logo"
        />
      </Link>

      {/* Desktop Nav Links */}
      <div className="flex items-center gap-4 lg:gap-8 max-md:hidden">
        <Link href="/" className="hover:text-gray-900 transition text-sm" onClick={() => beginLinkNavigation("/")}>Home</Link>
        <Link href="/all-products" className="hover:text-gray-900 transition text-sm" onClick={() => beginLinkNavigation("/all-products")}>Shop</Link>
        <Link href="/all-products?filter=flash" className="hover:text-orange-600 transition text-sm text-orange-500 font-medium" onClick={() => beginLinkNavigation("/all-products?filter=flash")}>⚡ Deals</Link>
        <Link href="/about" className="hover:text-gray-900 transition text-sm" onClick={() => beginLinkNavigation("/about")}>About Us</Link>
        {(showSeller) && (
          <button onClick={() => navigate('/seller')} className="text-xs border px-4 py-1.5 rounded-full hover:bg-gray-50 transition">
            🏪 Seller
          </button>
        )}
        {showAdmin && (
          <button onClick={() => navigate('/admin')} className="text-xs border border-orange-400 text-orange-600 px-4 py-1.5 rounded-full hover:bg-orange-50 transition">
            🛡️ Admin
          </button>
        )}
        {showRider && (
          <button onClick={() => navigate('/dashboard/rider')} className="text-xs border border-purple-400 text-purple-600 px-4 py-1.5 rounded-full hover:bg-purple-50 transition">
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
        {!clerkReady ? (
          <NavbarUserSkeleton showName />
        ) : user
          ? (
            <div className="relative">
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
              <UserButton
                showName
                userProfileMode="modal"
                appearance={userButtonAppearance}
              >
                <UserButton.MenuItems>
                  <UserButton.Action label="Cart" labelIcon={<CartIcon />} onClick={() => navigate('/cart')} />
                  <UserButton.Action label="My Orders" labelIcon={<BagIcon />} onClick={() => navigate('/my-orders')} />
                  <UserButton.Action label="Notifications" labelIcon="🔔" onClick={() => navigate('/notifications')} />
                </UserButton.MenuItems>
              </UserButton>
            </div>
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
        {showAdmin && (
          <button onClick={() => navigate('/admin')} className="text-xs border border-orange-400 text-orange-600 px-3 py-1 rounded-full">
            Admin
          </button>
        )}
        {showRider && (
          <button onClick={() => navigate('/dashboard/rider')} className="text-xs border border-purple-400 text-purple-600 px-3 py-1 rounded-full">
            Rider
          </button>
        )}
        {showSeller && (
          <button onClick={() => navigate('/seller')} className="text-xs border px-3 py-1 rounded-full">Seller</button>
        )}
        {!clerkReady ? (
          <NavbarUserSkeleton />
        ) : user
          ? (
            <UserButton
              userProfileMode="modal"
              appearance={userButtonAppearance}
            >
              <UserButton.MenuItems>
                <UserButton.Action label="Home" labelIcon={<HomeIcon />} onClick={() => navigate('/')} />
                <UserButton.Action label="Products" labelIcon={<BoxIcon />} onClick={() => navigate('/all-products')} />
                <UserButton.Action label="Cart" labelIcon={<CartIcon />} onClick={() => navigate('/cart')} />
                <UserButton.Action label="My Orders" labelIcon={<BagIcon />} onClick={() => navigate('/my-orders')} />
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
