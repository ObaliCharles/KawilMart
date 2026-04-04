import React from 'react'
import Skeleton from '@/components/Skeleton'

export const NavbarUserSkeleton = ({ showName = false, className = '' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden="true">
      {showName && <Skeleton className="hidden md:block h-4 w-28 rounded-full" />}
      <Skeleton className="h-10 w-10 rounded-full" />
    </div>
  )
}

export const DashboardShellSkeleton = ({ showSidebar = true }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" aria-hidden="true">
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showSidebar && <Skeleton className="md:hidden h-10 w-10 rounded-lg" />}
          <Skeleton className="h-8 w-28 rounded-md" />
          <Skeleton className="hidden md:block h-6 w-20 rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="hidden md:block h-4 w-24 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </header>

      <div className="flex flex-1">
        {showSidebar && (
          <aside className="hidden md:flex w-60 flex-col bg-white border-r border-gray-200 px-3 py-4 gap-2">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className="h-11 rounded-xl" />
            ))}
            <div className="mt-auto border-t border-gray-100 pt-4 space-y-2">
              <Skeleton className="h-10 rounded-lg" />
              <Skeleton className="h-10 rounded-lg" />
            </div>
          </aside>
        )}

        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <div className="space-y-6 max-w-7xl">
            <div className="space-y-2">
              <Skeleton className="h-8 w-56 rounded-xl max-w-full" />
              <Skeleton className="h-4 w-80 rounded-full max-w-full" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-28 rounded-2xl" />
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Skeleton className="xl:col-span-2 h-72 rounded-2xl" />
              <Skeleton className="h-72 rounded-2xl" />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export const AdminUsersPageSkeleton = () => {
  return (
    <div className="space-y-6 max-w-7xl" aria-hidden="true">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 rounded-xl max-w-full" />
        <Skeleton className="h-4 w-72 rounded-full max-w-full" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-3">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-8 w-14 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-10 w-64 rounded-lg max-w-full" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-24 rounded-lg" />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-4 md:p-5 space-y-4">
        <div className="hidden md:grid md:grid-cols-[2.4fr_1.7fr_1fr_1.2fr_1.1fr] gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-4 rounded-full" />
          ))}
        </div>

        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-[2.4fr_1.7fr_1fr_1.2fr_1.1fr] gap-4 items-center border-t border-gray-100 pt-4 first:border-t-0 first:pt-0"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32 rounded-full max-w-full" />
                <Skeleton className="h-3 w-20 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}

export const AdminManagementPageSkeleton = () => {
  return (
    <div className="w-full md:p-10 p-4 space-y-6" aria-hidden="true">
      <div className="space-y-2">
        <Skeleton className="h-7 w-44 rounded-xl" />
        <Skeleton className="h-4 w-72 rounded-full max-w-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32 rounded-full max-w-full" />
                <Skeleton className="h-3 w-full rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>

            <div className="space-y-2">
              {Array.from({ length: 4 }).map((__, rowIndex) => (
                <Skeleton key={rowIndex} className="h-4 w-full rounded-full" />
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Skeleton className="h-9 flex-1 rounded-md" />
              <Skeleton className="h-9 flex-1 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
