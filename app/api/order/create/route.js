import connectDB from "@/config/db";
import Address from "@/models/Address";
import Product from "@/models/Product";
import Order from "@/models/Order";
import User from "@/models/User";
import { getRequestUserId } from "@/lib/requestAuth";
import { NextResponse } from "next/server";
import { inngest } from "@/config/inngest";
import {
  createSellerOrderPlacedNotification,
  createStatusTrackingEvent,
} from "@/lib/orderTracking";
import { notifyUsers } from "@/lib/notifyUsers";

const sendOrderEvents = (createdOrders, userId, address) => {
  return Promise.allSettled(
    createdOrders.map((order) =>
      inngest.send({
        name: "order/created",
        data: {
          orderId: order._id.toString(),
          userId,
          sellerId: order.sellerId,
          items: order.items,
          address,
          amount: order.amount,
          date: order.date,
        },
      })
    )
  ).catch((error) => {
    console.error("Failed to queue order event(s):", error);
  });
};

const formatCurrency = (amount) => `UGX ${Number(amount || 0).toLocaleString("en-UG")}`;

export async function POST(request) {
  try {
    await connectDB();
    const userId = await getRequestUserId(request);
    const { address, items } = await request.json();

    if (!userId) return NextResponse.json({ success: false, message: "No userId found" });
    if (!address) return NextResponse.json({ success: false, message: "No address provided" });
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: "Cart is empty" });
    }

    const addressDoc = await Address.findById(address);
    if (!addressDoc) {
      return NextResponse.json({ success: false, message: "Selected address not found" });
    }

    const sellerOrders = new Map();

    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!Number.isFinite(quantity) || quantity <= 0) {
        continue;
      }

      const product = await Product.findById(item.product);
      if (!product) continue;

      const sellerId = product.userId;
      const price = product.offerPrice || product.price || 0;

      if (!sellerId || price <= 0) {
        continue;
      }

      const sellerBucket = sellerOrders.get(sellerId) || {
        sellerId,
        amount: 0,
        items: [],
      };

      sellerBucket.amount += price * quantity;
      sellerBucket.items.push({
        product: product._id.toString(),
        quantity,
        price,
      });

      sellerOrders.set(sellerId, sellerBucket);
    }

    const orderPayloads = Array.from(sellerOrders.values())
      .filter(({ items: groupedItems, amount, sellerId }) =>
        sellerId && groupedItems.length > 0 && amount > 0
      )
      .map(({ sellerId, items: groupedItems, amount }) => ({
        userId,
        sellerId,
        items: groupedItems,
        amount: Math.floor(amount + amount * 0.02),
        address,
        customerPhone: addressDoc.phoneNumber || "",
        trackingEvents: [createStatusTrackingEvent('Order Placed')],
        date: Date.now(),
      }));

    if (orderPayloads.length === 0) {
      return NextResponse.json({ success: false, message: "No valid products found" });
    }

    const createdOrders = await Order.create(orderPayloads);
    const totalItems = createdOrders.reduce(
      (sum, order) => sum + order.items.reduce((orderSum, item) => orderSum + item.quantity, 0),
      0
    );

    await User.findByIdAndUpdate(userId, {
      $set: { cartItems: {} },
    });

    const totalAmount = createdOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const customerName = addressDoc.fullName || "Customer";

    const customerNotificationEntry = {
      userId,
      notification: {
        type: "order",
        title: createdOrders.length > 1 ? "Orders placed successfully" : "Order placed successfully",
        message: `Your order for ${totalItems} item${totalItems === 1 ? "" : "s"} totaling ${formatCurrency(totalAmount)} has been received.`,
        read: false,
        date: new Date(),
      },
      emailTitle: createdOrders.length > 1 ? "Your KawilMart orders were placed" : "Your KawilMart order was placed",
      emailMessage: `We have received your order for ${totalItems} item${totalItems === 1 ? "" : "s"} totaling ${formatCurrency(totalAmount)}. You can track progress from your orders page.`,
      ctaLabel: "Track my order",
      ctaPath: "/my-orders",
      emailDetails: [
        { label: "orders", value: String(createdOrders.length) },
        { label: "items", value: String(totalItems) },
        { label: "total", value: formatCurrency(totalAmount) },
      ],
    };

    const sellerNotificationEntries = createdOrders
      .filter((order) => order?.sellerId)
      .map((order) => {
        const sellerItemCount = order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const shortOrderId = String(order._id).slice(-8).toUpperCase();
        const sellerTotal = formatCurrency(order.amount);
        const sellerNotification = createSellerOrderPlacedNotification({
          orderId: order._id,
          customerName,
          totalItems: sellerItemCount,
          totalAmount: sellerTotal,
        });

        return {
          userId: order.sellerId,
          notification: sellerNotification,
          emailTitle: `New customer order: #${shortOrderId}`,
          emailMessage: `${customerName} placed order #${shortOrderId} for ${sellerItemCount} item${sellerItemCount === 1 ? "" : "s"} totaling ${sellerTotal}. Open your seller dashboard to review and fulfill it.`,
          ctaLabel: "Open seller orders",
          ctaPath: "/seller/orders",
          emailDetails: [
            { label: "order_id", value: `#${shortOrderId}` },
            { label: "customer", value: customerName },
            { label: "items", value: String(sellerItemCount) },
            { label: "total", value: sellerTotal },
          ],
        };
      });

    await notifyUsers([customerNotificationEntry, ...sellerNotificationEntries]);

    void sendOrderEvents(createdOrders, userId, address);

    return NextResponse.json({
      success: true,
      message: createdOrders.length > 1 ? "Orders placed successfully" : "Order placed successfully",
      orderCount: createdOrders.length,
    });
  } catch (error) {
    console.error("Order API error:", error);
    return NextResponse.json({ success: false, message: error.message });
  }
}
