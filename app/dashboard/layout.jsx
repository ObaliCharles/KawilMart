'use client'
import React, { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const RiderLayout = ({ children }) => {
  const { sessionClaims, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  const isLoaded = isAuthLoaded && isUserLoaded;
  const role = user?.publicMetadata?.role || sessionClaims?.publicMetadata?.role || sessionClaims?.metadata?.role;
  const hasRiderAccess = role === 'rider' || role === 'admin';

  useEffect(() => {
    console.log('Rider Layout Debug:', { isLoaded, sessionClaims, role });
    if (isLoaded && !hasRiderAccess) {
      console.log('Redirecting from rider - no access');
      router.replace('/');
    } else {
      console.log('Rider access granted');
    }
  }, [hasRiderAccess, isLoaded, role, router, sessionClaims]);

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!hasRiderAccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
};

export default RiderLayout;
