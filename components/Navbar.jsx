"use client"
import React, { useEffect, useState } from "react";
import { assets, BagIcon, BoxIcon, CartIcon, HomeIcon } from "@/assets/assets";
import Link from "next/link"
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { useClerk, UserButton, useUser, useAuth } from "@clerk/nextjs";
import { NavbarUserSkeleton } from "@/components/dashboard/DashboardSkeletons";
import { usePathname } from "next/navigation";

const userButtonAppearance = {
  elements: {
    avatarBox: "h-10 w-10 rounded-full ring-2 ring-orange-200 shadow-sm overflow-hidden",
    userButtonTrigger: "focus:shadow-none",
  },
};

const formatBadgeCount = (count) => {
  if (count > 99) {
    return "99+";
  }

  return String(count);
};

const NotificationIcon = () => (
  <svg className="w-5 h-5 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 5a4 4 0 0 0-4 4v2.9c0 .5-.2 1-.5 1.4L6 15h12l-1.5-1.7c-.3-.4-.5-.9-.5-1.4V9a4 4 0 0 0-4-4Zm0 14a2.5 2.5 0 0 0 2.4-2H9.6A2.5 2.5 0 0 0 12 19Z" />
  </svg>
);

const Navbar = () => {
  const {
    isSeller,
    isAdmin,
    isRider,
    navigate,
    prefetchRoute,
    resolvedRole,
    setIsRouteLoading,
    getCartCount,
    unreadNotificationsCount,
    refreshUnreadNotifications,
  } = useAppContext();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { isLoaded: isAuthLoaded } = useAuth();
  const { openSignIn } = useClerk();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDesktopViewport, setIsDesktopViewport] = useState(null);
  const clerkReady = isUserLoaded && isAuthLoaded;
  const cartCount = getCartCount();
  // Check both context values and user metadata for roles
  const userRole = resolvedRole || user?.publicMetadata?.role;
  const showAdmin = isAdmin || userRole === 'admin';
  const showRider = isRider || userRole === 'rider';
  const showSeller = isSeller || userRole === 'seller' || userRole === 'admin';
  const mobileDashboardLink = showAdmin
    ? { href: '/admin', label: 'Admin', className: 'border-orange-400 text-orange-600' }
    : showRider
      ? { href: '/dashboard/rider', label: 'Rider', className: 'border-purple-400 text-purple-600' }
      : showSeller
        ? { href: '/seller', label: 'Seller', className: 'border-gray-300 text-gray-700' }
        : null;
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/all-products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const syncViewport = (event) => {
      setIsDesktopViewport(event.matches);
    };

    setIsDesktopViewport(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncViewport);

      return () => {
        mediaQuery.removeEventListener('change', syncViewport);
      };
    }

    mediaQuery.addListener(syncViewport);

    return () => {
      mediaQuery.removeListener(syncViewport);
    };
  }, []);

  useEffect(() => {
    if (!clerkReady) {
      return;
    }

    if (!user) {
      return;
    }

    let timeoutId;
    let idleId;

    const scheduleFetch = () => {
      void refreshUnreadNotifications({ silent: true });
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
  }, [clerkReady, refreshUnreadNotifications, user]);

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

  const openCart = () => {
    navigate('/cart');
  };

  const renderUserButton = ({ showName = false, includeMobileLinks = false, badgeClassName }) => (
    <div className="relative inline-flex items-center justify-center pr-1 pt-1">
      {unreadNotificationsCount > 0 && (
        <span className={badgeClassName}>
          {formatBadgeCount(unreadNotificationsCount)}
        </span>
      )}
      <UserButton
        showName={showName}
        userProfileMode="modal"
        appearance={userButtonAppearance}
      >
        <UserButton.MenuItems>
          {includeMobileLinks ? <UserButton.Link label="Home" labelIcon={<HomeIcon />} href="/" /> : null}
          {includeMobileLinks ? <UserButton.Link label="Products" labelIcon={<BoxIcon />} href="/all-products" /> : null}
          <UserButton.Link label="Cart" labelIcon={<CartIcon />} href="/cart" />
          <UserButton.Link label="My Orders" labelIcon={<BagIcon />} href="/my-orders" />
          <UserButton.Link label="Notifications" labelIcon={<NotificationIcon />} href="/notifications" />
        </UserButton.MenuItems>
      </UserButton>
    </div>
  );

  return (
    <nav className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-300 bg-white px-4 py-3 text-gray-700 sm:px-6 md:px-16 lg:px-32">
      <Link href="/" prefetch className="block" onClick={() => beginLinkNavigation("/")}>
        <Image
          className="w-24 cursor-pointer sm:w-28 md:w-32"
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
        <button
          onClick={openCart}
          onMouseEnter={() => prefetchRoute('/cart')}
          onFocus={() => prefetchRoute('/cart')}
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white transition hover:border-orange-300 hover:bg-orange-50"
          aria-label="Open cart"
        >
          <CartIcon />
          {cartCount > 0 && (
            <span className="pointer-events-none absolute -right-1.5 -top-1.5 z-20 inline-flex min-w-[1.15rem] items-center justify-center rounded-full bg-orange-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white shadow-sm">
              {formatBadgeCount(cartCount)}
            </span>
          )}
        </button>
        {!clerkReady ? (
          <NavbarUserSkeleton showName />
        ) : isDesktopViewport === null ? (
          <NavbarUserSkeleton showName />
        ) : user
          ? (
            isDesktopViewport
              ? renderUserButton({
                  showName: true,
                  badgeClassName: "pointer-events-none absolute right-0 top-0 z-20 inline-flex min-w-[1.15rem] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white shadow-sm",
                })
              : null
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
      <div className="flex min-w-0 items-center gap-2 md:hidden">
        {mobileDashboardLink && (
          <button
            onClick={() => navigate(mobileDashboardLink.href)}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${mobileDashboardLink.className}`}
          >
            {mobileDashboardLink.label}
          </button>
        )}
        <button
          onClick={openCart}
          onMouseEnter={() => prefetchRoute('/cart')}
          onFocus={() => prefetchRoute('/cart')}
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white transition hover:border-orange-300 hover:bg-orange-50 sm:h-10 sm:w-10"
          aria-label="Open cart"
        >
          <CartIcon />
          {cartCount > 0 && (
            <span className="pointer-events-none absolute -right-1.5 -top-1.5 z-20 inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-orange-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white shadow-sm">
              {formatBadgeCount(cartCount)}
            </span>
          )}
        </button>
        {!clerkReady ? (
          <NavbarUserSkeleton />
        ) : isDesktopViewport === null ? (
          <NavbarUserSkeleton />
        ) : user
          ? (
            !isDesktopViewport
              ? renderUserButton({
                  includeMobileLinks: true,
                  badgeClassName: "pointer-events-none absolute right-0 top-0 z-20 inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white shadow-sm",
                })
              : null
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
