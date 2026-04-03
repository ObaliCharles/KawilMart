import { getRequestUserId } from "@/lib/requestAuth";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import authRider from "@/lib/authRider";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Address from "@/models/Address";

export async function GET(request) {
    try {
        const userId = await getRequestUserId(request);
        const isRider = await authRider(userId);
        if (!isRider) return NextResponse.json({ success: false, message: "Unauthorized" });

        await connectDB();

        // Riders see orders that are Shipped or Out for Delivery
        const deliveries = await Order.find({
            status: { $in: ['Shipped', 'Out for Delivery', 'Processing', 'Order Placed'] }
        })
            .populate({ path: "items.product", model: Product })
            .populate({ path: "address", model: Address })
            .sort({ date: -1 });

        return NextResponse.json({ success: true, deliveries });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}

export async function PUT(request) {
    try {
        const userId = await getRequestUserId(request);
        const isRider = await authRider(userId);
        if (!isRider) return NextResponse.json({ success: false, message: "Unauthorized" });

        const { orderId, status } = await request.json();
        const allowedStatuses = ['Out for Delivery', 'Delivered'];
        if (!allowedStatuses.includes(status)) {
            return NextResponse.json({ success: false, message: "Riders can only mark Out for Delivery or Delivered" });
        }

        await connectDB();
        await Order.findByIdAndUpdate(orderId, { status });

        return NextResponse.json({ success: true, message: `Marked as ${status}` });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
