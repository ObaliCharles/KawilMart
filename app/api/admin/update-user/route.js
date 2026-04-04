import { clerkClient } from "@clerk/nextjs/server";
import { getRequestUserId } from "@/lib/requestAuth";
import { invalidateUserRoleCache } from "@/lib/userRoleCache";
import { NextResponse } from "next/server";
import authAdmin from "@/lib/authAdmin";
import connectDB from "@/config/db";
import User from "@/models/User";

export async function POST(request) {
    try {
        const userId = await getRequestUserId(request);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin) return NextResponse.json({ success: false, message: "Unauthorized" });

        const { targetUserId, updates } = await request.json();

        await connectDB();

        // Update user in database
        const updatedUser = await User.findByIdAndUpdate(targetUserId, updates, { new: true });

        // Update user metadata in Clerk if role is being changed
        if (updates.role) {
            const client = await clerkClient();
            await client.users.updateUser(targetUserId, {
                publicMetadata: { role: updates.role }
            });
            invalidateUserRoleCache(targetUserId);
        }

        return NextResponse.json({
            success: true,
            message: "User updated successfully",
            user: updatedUser
        });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
