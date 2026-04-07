import { getOrSyncDatabaseUser } from "@/lib/clerkUserSync";
import { getRequestUserId } from "@/lib/requestAuth";
import { NextResponse } from "next/server";


export async function GET(request) {

    try {
        const userId = await getRequestUserId(request);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Not authenticated" })
        }

        const user = await getOrSyncDatabaseUser(userId)

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" })
        }

        return NextResponse.json({ success:true, user})

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message })
    }


}
