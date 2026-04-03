import connectDB from "@/config/db"
import User from "@/models/User"
import { getAuth, clerkClient } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"


export async function POST(request) {
    try {

        const  { userId } = getAuth(request)

        const { cartData } = await request.json()

        await connectDB()
        let user = await User.findById(userId)

        if (!user) {
            // Create user if they don't exist
            const client = await clerkClient()
            const clerkUser = await client.users.getUser(userId)

            user = await User.create({
                _id: userId,
                name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
                email: clerkUser.emailAddresses[0]?.emailAddress || '',
                imageUrl: clerkUser.imageUrl,
            })
        }

        user.cartItems = cartData
        await user.save()

        return NextResponse.json({ success: true, message: "Cart updated successfully" })

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message })
    }
}