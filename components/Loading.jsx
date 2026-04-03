import React from 'react'

const Loading = ({ message = "Items refreshing..." }) => {
    return (
        <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-orange-300 border-gray-200"></div>
            <p className="text-gray-600 text-lg font-medium">{message}</p>
        </div>
    )
}

export default Loading