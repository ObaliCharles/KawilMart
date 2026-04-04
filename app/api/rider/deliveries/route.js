import { getRequestUserId } from "@/lib/requestAuth";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import authRider from "@/lib/authRider";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Address from "@/models/Address";
import { getUserRole } from "@/lib/userRoleCache";

export async function GET(request) {
    try {
        const userId = await getRequestUserId(request);
        const isRider = await authRider(userId);
        if (!isRider) return NextResponse.json({ success: false, message: "Unauthorized" });

        await connectDB();
        const role = await getUserRole(userId);
        const baseFilter = {
            status: { $in: ['Shipped', 'Out for Delivery', 'Processing', 'Order Placed', 'Delivered'] }
        };

        const deliveries = await Order.find(
            role === 'admin'
                ? baseFilter
                : { ...baseFilter, riderId: userId }
        )
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
        const role = await getUserRole(userId);

        const { orderId, status } = await request.json();
        const allowedStatuses = ['Out for Delivery', 'Delivered'];
        if (!allowedStatuses.includes(status)) {
            return NextResponse.json({ success: false, message: "Riders can only mark Out for Delivery or Delivered" });
        }

        await connectDB();
        const order = await Order.findById(orderId);
        if (!order) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }

        if (role !== 'admin' && order.riderId !== userId) {
            return NextResponse.json({ success: false, message: "This delivery is not assigned to you" }, { status: 403 });
        }

        order.status = status;
        await order.save();

        return NextResponse.json({ success: true, message: `Marked as ${status}` });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
