import React from 'react'

const Skeleton = ({ className = '' }) => {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
    />
  )
}

export default Skeleton
