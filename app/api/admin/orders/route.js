import { getRequestUserId } from "@/lib/requestAuth";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import authAdmin from "@/lib/authAdmin";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Address from "@/models/Address";

export async function GET(request) {
    try {
        const userId = await getRequestUserId(request);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin) return NextResponse.json({ success: false, message: "Unauthorized" });

        await connectDB();
        const orders = await Order.find({})
            .populate({ path: "items.product", model: Product })
            .populate({ path: "address", model: Address })
            .sort({ date: -1 });

        return NextResponse.json({ success: true, orders });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}

export async function PUT(request) {
    try {
        const userId = await getRequestUserId(request);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin) return NextResponse.json({ success: false, message: "Unauthorized" });

        const { orderId, status } = await request.json();
        await connectDB();
        await Order.findByIdAndUpdate(orderId, { status });

        return NextResponse.json({ success: true, message: "Order status updated" });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
