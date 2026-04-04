import { clerkClient } from "@clerk/nextjs/server";
import authSeller from "@/lib/authSeller";
import { getRequestUserId } from "@/lib/requestAuth";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Address from "@/models/Address"; // ensures Mongoose registers Address
import Order from "@/models/Order"; // ensures Mongoose registers Order
import Product from "@/models/Product"; // ensures Mongoose registers Product
import { getUserRole } from "@/lib/userRoleCache";
import {
  createAssignmentNotification,
  createPaymentNotification,
  createPaymentTrackingEvent,
  createRiderAssignmentTrackingEvent,
} from "@/lib/orderTracking";
import { notifyUsers } from "@/lib/notifyUsers";

const toDisplayName = (clerkUser) => {
  const fullName = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();
  return fullName || clerkUser.emailAddresses[0]?.emailAddress || "Rider";
};

export async function GET(request) {
  try {
    const userId = await getRequestUserId(request);

    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json({ success: false, message: "Unauthorized" });
    }

    await connectDB();

    const orders = await Order.find({ sellerId: userId })
      .populate({
        path: "items.product",
        model: Product
      })
      .populate({
        path: "address",
        model: Address
      })
      .sort({ date: -1 }); // optional: newest first

    const client = await clerkClient();
    const clerkUsers = await client.users.getUserList({ limit: 100 });
    const riders = clerkUsers.data
      .filter((account) => {
        const role = account.publicMetadata?.role || account.metadata?.role;
        return role === "rider" || role === "admin";
      })
      .map((account) => ({
        id: account.id,
        name: toDisplayName(account),
        email: account.emailAddresses[0]?.emailAddress || "",
        imageUrl: account.imageUrl,
      }));

    return NextResponse.json({ success: true, orders, riders });
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    return NextResponse.json({ success: false, message: error.message });
  }
}

export async function PUT(request) {
  try {
    const userId = await getRequestUserId(request);

    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json({ success: false, message: "Unauthorized" });
    }

    const { orderId, riderId, paymentStatus } = await request.json();
    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID is required" }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findOne({ _id: orderId, sellerId: userId });
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    const previousRiderId = order.riderId || null;
    const previousPaymentStatus = order.paymentStatus || "Pending";
    const validPaymentStatuses = Order.schema.path("paymentStatus")?.enumValues || ["Pending", "Paid", "Failed"];
    const customerNotifications = [];
    const outboundNotifications = [];
    const updatedFields = [];

    if (riderId !== undefined) {
      if (riderId) {
        const riderRole = await getUserRole(riderId);
        if (riderRole !== "rider" && riderRole !== "admin") {
          return NextResponse.json({ success: false, message: "Selected user is not a rider" }, { status: 400 });
        }

        order.riderId = riderId;

        if (riderId !== previousRiderId) {
          const shortOrderId = String(order._id).slice(-8).toUpperCase();
          order.trackingEvents = [
            ...(order.trackingEvents || []),
            createRiderAssignmentTrackingEvent({ assigned: true }),
          ];
          customerNotifications.push(createAssignmentNotification(order._id, true));
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
            emailMessage: `Order #${shortOrderId} has been assigned to you for delivery. Open your rider dashboard to review the delivery details.`,
            ctaLabel: "Open rider dashboard",
            ctaPath: "/dashboard/rider",
          });
          updatedFields.push("rider");
        }
      } else {
        order.riderId = null;

        if (previousRiderId) {
          order.trackingEvents = [
            ...(order.trackingEvents || []),
            createRiderAssignmentTrackingEvent({ assigned: false }),
          ];
          customerNotifications.push(createAssignmentNotification(order._id, false));
          updatedFields.push("rider");
        }
      }
    }

    if (paymentStatus !== undefined) {
      const normalizedPaymentStatus = typeof paymentStatus === "string" ? paymentStatus.trim() : "";

      if (!validPaymentStatuses.includes(normalizedPaymentStatus)) {
        return NextResponse.json({
          success: false,
          message: `Invalid payment status. Allowed values: ${validPaymentStatuses.join(", ")}`,
        }, { status: 400 });
      }

      if (normalizedPaymentStatus !== previousPaymentStatus) {
        order.paymentStatus = normalizedPaymentStatus;
        order.trackingEvents = [
          ...(order.trackingEvents || []),
          createPaymentTrackingEvent(normalizedPaymentStatus),
        ];
        customerNotifications.push(createPaymentNotification(normalizedPaymentStatus, order._id));
        updatedFields.push("payment");
      }
    }

    if (updatedFields.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No order changes were made",
        order,
      });
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

    return NextResponse.json({
      success: true,
      message: updatedFields.length > 1
        ? "Order updated successfully"
        : updatedFields[0] === "payment"
          ? "Payment status updated successfully"
          : order.riderId
            ? "Rider assigned successfully"
            : "Rider removed successfully",
      order,
    });
  } catch (error) {
    console.error("Error updating seller order:", error);
    return NextResponse.json({ success: false, message: error.message });
  }
}
