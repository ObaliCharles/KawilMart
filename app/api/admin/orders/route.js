import { getRequestUserId } from "@/lib/requestAuth";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import authAdmin from "@/lib/authAdmin";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Address from "@/models/Address";
import { getUserRole } from "@/lib/userRoleCache";
import {
    createAssignmentNotification,
    createRiderAssignmentTrackingEvent,
    createStatusNotification,
    createStatusTrackingEvent,
} from "@/lib/orderTracking";
import { notifyUsers } from "@/lib/notifyUsers";

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

        const customerNotifications = [];
        const outboundNotifications = [];
        const previousStatus = order.status;
        const previousRiderId = order.riderId || null;

        if (typeof status === "string" && status) {
            if (status !== previousStatus) {
                order.status = status;
                order.trackingEvents = [
                    ...(order.trackingEvents || []),
                    createStatusTrackingEvent(status),
                ];
                customerNotifications.push(createStatusNotification(status, order._id));
            }
        }

        if (riderId !== undefined) {
            if (riderId) {
                const riderRole = await getUserRole(riderId);
                if (riderRole !== "rider" && riderRole !== "admin") {
                    return NextResponse.json({ success: false, message: "Selected user is not a rider" }, { status: 400 });
                }
                order.riderId = riderId;

                if (riderId !== previousRiderId) {
                    const shortOrderId = String(order._id).slice(-8).toUpperCase();
                    outboundNotifications.push({
                        userId: riderId,
                        notification: {
                            type: "order",
                            title: "New delivery assigned",
                            message: `Order #${shortOrderId} has been assigned to you.`,
                            read: false,
                            date: new Date(),
                        },
                        emailTitle: `New delivery assigned: #${shortOrderId}`,
                        emailMessage: `Order #${shortOrderId} has been assigned to you for delivery. Open your rider dashboard to review pickup and drop-off details.`,
                        ctaLabel: "Open rider dashboard",
                        ctaPath: "/dashboard/rider",
                    });

                    order.trackingEvents = [
                        ...(order.trackingEvents || []),
                        createRiderAssignmentTrackingEvent({ assigned: true }),
                    ];
                    customerNotifications.push(createAssignmentNotification(order._id, true));
                }
            } else {
                order.riderId = null;

                if (previousRiderId) {
                    order.trackingEvents = [
                        ...(order.trackingEvents || []),
                        createRiderAssignmentTrackingEvent({ assigned: false }),
                    ];
                    customerNotifications.push(createAssignmentNotification(order._id, false));
                }
            }
        }

        await order.save();

        if (customerNotifications.length > 0) {
            outboundNotifications.push(
                ...customerNotifications.map((notification) => ({
                    userId: order.userId,
                    notification,
                    emailTitle: notification.title,
                    emailMessage: notification.message,
                    ctaLabel: "Track order",
                    ctaPath: "/my-orders",
                }))
            );
        }

        if (outboundNotifications.length > 0) {
            await notifyUsers(outboundNotifications);
        }

        return NextResponse.json({ success: true, message: "Order updated", order });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
