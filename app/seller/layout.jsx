'use client'
import Navbar from '@/components/seller/Navbar'
import Sidebar from '@/components/seller/Sidebar'
import React, { useEffect } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

const Layout = ({ children }) => {
  const { sessionClaims, isLoaded } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const role = user?.publicMetadata?.role || sessionClaims?.publicMetadata?.role || sessionClaims?.metadata?.role

  useEffect(() => {
    if (isLoaded && (!sessionClaims || (role !== 'seller' && role !== 'admin'))) {
      router.push('/')
    }
  }, [isLoaded, sessionClaims, role, router])

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!sessionClaims || (role !== 'seller' && role !== 'admin')) {
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