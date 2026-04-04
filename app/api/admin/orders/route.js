import { getRequestUserId } from "@/lib/requestAuth";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import authAdmin from "@/lib/authAdmin";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Address from "@/models/Address";
import User from "@/models/User";
import { getUserRole } from "@/lib/userRoleCache";

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

        const { orderId, status, riderId } = await request.json();
        await connectDB();

        const order = await Order.findById(orderId);
        if (!order) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }

        if (typeof status === "string" && status) {
            order.status = status;
        }

        if (riderId !== undefined) {
            if (riderId) {
                const riderRole = await getUserRole(riderId);
                if (riderRole !== "rider" && riderRole !== "admin") {
                    return NextResponse.json({ success: false, message: "Selected user is not a rider" }, { status: 400 });
                }
                order.riderId = riderId;

                await User.findByIdAndUpdate(riderId, {
                    $push: {
                        notifications: {
                            type: "order",
                            title: "New delivery assigned",
                            message: `Order #${String(order._id).slice(-8).toUpperCase()} has been assigned to you.`,
                            read: false,
                            date: new Date(),
                        }
                    }
                });
            } else {
                order.riderId = null;
            }
        }

        await order.save();

        return NextResponse.json({ success: true, message: "Order updated", order });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
