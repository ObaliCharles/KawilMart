import connectDB from "@/config/db";
import { getRequestUserId } from "@/lib/requestAuth";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const userId = await getRequestUserId(request)
        if (!userId) {
            return NextResponse.json({ success: false, message: "Not authenticated" })
        }

        await connectDB()
        const user = await User.findById(userId)

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" })
        }

        const notifications = [...(user.notifications || [])].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )

        return NextResponse.json({ success: true, notifications })

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message })
    }
}

export async function POST(request) {
    try {
        const userId = await getRequestUserId(request)
        if (!userId) {
            return NextResponse.json({ success: false, message: "Not authenticated" })
        }

        const { notificationId } = await request.json()

        await connectDB()

        // Mark notification as read
        await User.findByIdAndUpdate(userId, {
            $set: { 'notifications.$[elem].read': true }
        }, {
            arrayFilters: [{ 'elem._id': notificationId }]
        })

        const updatedUser = await User.findById(userId).select('notifications')
        const unreadCount = (updatedUser?.notifications || []).filter((notification) => !notification.read).length

        return NextResponse.json({
            success: true,
            message: "Notification marked as read",
            unreadCount,
        })

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message })
    }
}
