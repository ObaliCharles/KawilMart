import { clerkClient } from "@clerk/nextjs/server";
import { getRequestUserId } from "@/lib/requestAuth";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const userId = await getRequestUserId(request);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Not authenticated" });
        }

        const client = await clerkClient();
        const user = await client.users.getUser(userId);

        // Set admin role
        await client.users.updateUser(userId, {
            publicMetadata: {
                ...user.publicMetadata,
                role: 'admin'
            }
        });

        return NextResponse.json({
            success: true,
            message: "Admin role set successfully! Please refresh the page."
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
