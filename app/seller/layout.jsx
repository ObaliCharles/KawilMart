'use client'
import Navbar from '@/components/seller/Navbar'
import Sidebar from '@/components/seller/Sidebar'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAppContext } from '@/context/AppContext'
import toast from 'react-hot-toast'
import { useAuth } from '@clerk/nextjs'
import { DashboardShellSkeleton } from '@/components/dashboard/DashboardSkeletons'

const Layout = ({ children }) => {
  const { authReady, accessLoaded, loadingUser, isSeller, resolvedRole, syncAdminAccess } = useAppContext()
  const { userId } = useAuth()
  const [autoSyncTried, setAutoSyncTried] = useState(false)
  const accessReady = authReady && accessLoaded && !loadingUser
  const canAutoSyncAccess = process.env.NODE_ENV !== 'production'

  useEffect(() => {
    if (!canAutoSyncAccess || !userId || !accessReady || isSeller || autoSyncTried) {
      return
    }

    setAutoSyncTried(true)
    void syncAdminAccess()
  }, [accessReady, autoSyncTried, canAutoSyncAccess, isSeller, syncAdminAccess, userId])

  if (!accessReady) {
    return <DashboardShellSkeleton />
  }

  if (!isSeller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🏪</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Seller Access Required</h1>
          <p className="text-gray-600 mb-6">
            Your current role is <strong>{resolvedRole || 'buyer'}</strong>.
            You need a seller or admin role to add products and manage seller pages.
          </p>
          {canAutoSyncAccess && (
            <button
              onClick={async () => {
                const data = await syncAdminAccess()
                if (data.success) {
                  toast.success(data.message)
                } else {
                  toast.error(data.message || 'Failed to sync admin access')
                }
              }}
              className="w-full mb-3 bg-orange-600 text-white py-3 px-5 rounded-lg hover:bg-orange-700 transition font-medium"
            >
              Sync My Admin Access
            </button>
          )}
          <Link href="/" className="inline-flex bg-orange-600 text-white py-3 px-5 rounded-lg hover:bg-orange-700 transition font-medium">
            Back to Store
          </Link>
        </div>
      </div>
    )
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
