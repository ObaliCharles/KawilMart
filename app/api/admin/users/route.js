import { clerkClient } from "@clerk/nextjs/server";
import { getRequestUserId } from "@/lib/requestAuth";
import { invalidateUserRoleCache } from "@/lib/userRoleCache";
import { NextResponse } from "next/server";
import authAdmin from "@/lib/authAdmin";
import connectDB from "@/config/db";
import User from "@/models/User";

export async function GET(request) {
    try {
        const userId = await getRequestUserId(request);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin) return NextResponse.json({ success: false, message: "Unauthorized" });

        const client = await clerkClient();
        const clerkUsers = await client.users.getUserList({ limit: 100 });

        await connectDB();
        const dbUsers = await User.find({});
        const dbMap = {};
        dbUsers.forEach(u => { dbMap[u._id] = u; });

        const users = clerkUsers.data.map(u => ({
            id: u.id,
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
            email: u.emailAddresses[0]?.emailAddress || '',
            imageUrl: u.imageUrl,
            role: u.publicMetadata.role || 'buyer',
            createdAt: u.createdAt,
            cartItems: dbMap[u.id]?.cartItems || {},
            // Database fields
            businessName: dbMap[u.id]?.businessName,
            businessLocation: dbMap[u.id]?.businessLocation,
            phoneNumber: dbMap[u.id]?.phoneNumber,
            businessLicense: dbMap[u.id]?.businessLicense,
            taxId: dbMap[u.id]?.taxId,
            vehicleType: dbMap[u.id]?.vehicleType,
            licensePlate: dbMap[u.id]?.licensePlate,
            driversLicense: dbMap[u.id]?.driversLicense,
            isVerified: dbMap[u.id]?.isVerified || false,
            notifications: dbMap[u.id]?.notifications || [],
            messages: dbMap[u.id]?.messages || [],
        }));

        return NextResponse.json({ success: true, users });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}

export async function POST(request) {
    try {
        const userId = await getRequestUserId(request);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin) return NextResponse.json({ success: false, message: "Unauthorized" });

        const { targetUserId, role } = await request.json();
        const validRoles = ['buyer', 'seller', 'admin', 'rider'];
        if (!validRoles.includes(role)) {
            return NextResponse.json({ success: false, message: "Invalid role" });
        }

        const client = await clerkClient();
        await client.users.updateUserMetadata(targetUserId, {
            publicMetadata: { role }
        });
        invalidateUserRoleCache(targetUserId);

        return NextResponse.json({ success: true, message: `Role updated to ${role}` });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
