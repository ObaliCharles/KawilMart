import { NextResponse } from "next/server";
import { getRequestAuth } from "@/lib/requestAuth";
import { getUserRole } from "@/lib/userRoleCache";

export async function GET(request) {
    try {
        const { userId, sessionClaims } = await getRequestAuth(request);

        if (!userId) {
            return NextResponse.json({
                success: true,
                access: {
                    authenticated: false,
                    userId: null,
                    role: null,
                    isAdmin: false,
                    isSeller: false,
                    isRider: false,
                },
            });
        }

        const sessionRole =
            sessionClaims?.publicMetadata?.role ||
            sessionClaims?.metadata?.role ||
            null;
        const role = sessionRole || await getUserRole(userId);

        return NextResponse.json({
            success: true,
            access: {
                authenticated: true,
                userId,
                role,
                isAdmin: role === "admin",
                isSeller: role === "seller" || role === "admin",
                isRider: role === "rider" || role === "admin",
            },
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message,
        });
    }
}
