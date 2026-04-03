'use client'
import Navbar from '@/components/seller/Navbar'
import Sidebar from '@/components/seller/Sidebar'
import React, { useEffect } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

const Layout = ({ children }) => {
  const { sessionClaims, isLoaded: isAuthLoaded } = useAuth()
  const { user, isLoaded: isUserLoaded } = useUser()
  const router = useRouter()
  const isLoaded = isAuthLoaded && isUserLoaded
  const role = user?.publicMetadata?.role || sessionClaims?.publicMetadata?.role || sessionClaims?.metadata?.role
  const hasSellerAccess = role === 'seller' || role === 'admin'

  useEffect(() => {
    if (isLoaded && !hasSellerAccess) {
      router.replace('/')
    }
  }, [hasSellerAccess, isLoaded, router])

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!hasSellerAccess) {
    return null
  }

  return (
    <div>
      <Navbar />
      <div className='flex w-full'>
        <Sidebar />
        {children}
      </div>
    </div>
  )
}

export default Layout
