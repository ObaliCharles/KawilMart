import connectDB from "@/config/db";
import User from "@/models/User";
import { getRequestUserId } from "@/lib/requestAuth";
import { NextResponse } from "next/server";



export async function GET(request) {
    try {
        const userId = await getRequestUserId(request);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Not authenticated" });
        }

        await connectDB()
        const user = await User.findById(userId)

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" })
        }

        const { cartItems } = user

        return NextResponse.json({ success: true, cartItems })

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message })
    }
}
