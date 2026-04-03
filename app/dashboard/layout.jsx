'use client'
import React, { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const RiderLayout = ({ children }) => {
  const { sessionClaims, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const role = user?.publicMetadata?.role || sessionClaims?.publicMetadata?.role || sessionClaims?.metadata?.role;

  useEffect(() => {
    console.log('Rider Layout Debug:', { isLoaded, sessionClaims, role });
    if (isLoaded && (!sessionClaims || (role !== 'rider' && role !== 'admin'))) {
      console.log('Redirecting from rider - no access');
      router.push('/');
    } else {
      console.log('Rider access granted');
    }
  }, [isLoaded, sessionClaims, role, router]);

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!sessionClaims || (role !== 'rider' && role !== 'admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
};

export default RiderLayout;