import { clerkClient } from "@clerk/nextjs/server";
import { getRequestUserId } from "@/lib/requestAuth";
import { invalidateUserRoleCache } from "@/lib/userRoleCache";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const userId = await getRequestUserId(request);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Not authenticated" });
        }

        const client = await clerkClient();
        await client.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'admin'
            }
        });
        invalidateUserRoleCache(userId);

        return NextResponse.json({
            success: true,
            message: "Admin role set successfully! Please refresh the page."
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
