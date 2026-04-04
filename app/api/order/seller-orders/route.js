import { clerkClient } from "@clerk/nextjs/server";
import authSeller from "@/lib/authSeller";
import { getRequestUserId } from "@/lib/requestAuth";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Address from "@/models/Address"; // ensures Mongoose registers Address
import Order from "@/models/Order"; // ensures Mongoose registers Order
import Product from "@/models/Product"; // ensures Mongoose registers Product
import User from "@/models/User";
import { getUserRole } from "@/lib/userRoleCache";

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

    const { orderId, riderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID is required" }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findOne({ _id: orderId, sellerId: userId });
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    const previousRiderId = order.riderId || null;

    if (riderId) {
      const riderRole = await getUserRole(riderId);
      if (riderRole !== "rider" && riderRole !== "admin") {
        return NextResponse.json({ success: false, message: "Selected user is not a rider" }, { status: 400 });
      }

      order.riderId = riderId;
    } else {
      order.riderId = null;
    }

    await order.save();

    if (order.riderId && order.riderId !== previousRiderId) {
      await User.findByIdAndUpdate(order.riderId, {
        $push: {
          notifications: {
            type: "order",
            title: "New delivery assigned",
            message: `Order #${String(order._id).slice(-8).toUpperCase()} has been assigned to you.`,
            read: false,
            date: new Date(),
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: order.riderId ? "Rider assigned successfully" : "Rider removed successfully",
      order,
    });
  } catch (error) {
    console.error("Error updating seller order:", error);
    return NextResponse.json({ success: false, message: error.message });
  }
}
