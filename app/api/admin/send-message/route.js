import { getRequestUserId } from "@/lib/requestAuth";
import { NextResponse } from "next/server";
import authAdmin from "@/lib/authAdmin";
import connectDB from "@/config/db";
import User from "@/models/User";

export async function POST(request) {
    try {
        const userId = await getRequestUserId(request);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin) return NextResponse.json({ success: false, message: "Unauthorized" });

        const { to, subject, content } = await request.json();

        await connectDB();

        // Add message to recipient's messages array
        const updatedUser = await User.findByIdAndUpdate(to, {
            $push: {
                messages: {
                    from: userId,
                    to,
                    subject,
                    content,
                    read: false,
                    date: new Date()
                }
            },
            $push: {
                notifications: {
                    type: 'message',
                    title: `New message: ${subject}`,
                    message: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
                    read: false,
                    date: new Date()
                }
            }
        }, { new: true });

        return NextResponse.json({
            success: true,
            message: "Message sent successfully"
        });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}