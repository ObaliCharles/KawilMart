import { getOrSyncDatabaseUser } from "@/lib/clerkUserSync"
import { getRequestUserId } from "@/lib/requestAuth"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request) {
    try {
        const userId = await getRequestUserId(request)
        if (!userId) {
            return NextResponse.json({ success: false, message: "Not authenticated" })
        }

        const { cartData } = await request.json()

        const user = await getOrSyncDatabaseUser(userId)

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
        }

        user.cartItems = cartData
        await user.save()

        return NextResponse.json({ success: true, message: "Cart updated successfully" })

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message })
    }
}
