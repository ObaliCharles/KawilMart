import connectDB from "@/config/db";
import Address from "@/models/Address";
import Product from "@/models/Product";
import Order from "@/models/Order";
import User from "@/models/User";
import { getRequestUserId } from "@/lib/requestAuth";
import { NextResponse } from "next/server";
import { inngest } from "@/config/inngest";

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
      $push: {
        notifications: {
          type: "order",
          title: createdOrders.length > 1 ? "Orders placed successfully" : "Order placed successfully",
          message: `Your order for ${totalItems} item${totalItems === 1 ? "" : "s"} totaling UGX ${createdOrders
            .reduce((sum, order) => sum + (order.amount || 0), 0)
            .toLocaleString("en-UG")} has been received.`,
          read: false,
          date: new Date(),
        },
      },
    });

    await User.bulkWrite(
      createdOrders.map((order) => ({
        updateOne: {
          filter: { _id: order.sellerId },
          update: {
            $push: {
              notifications: {
                type: "order",
                title: "New order received",
                message: `Order #${String(order._id).slice(-8).toUpperCase()} includes ${order.items.reduce((sum, item) => sum + item.quantity, 0)} item${order.items.reduce((sum, item) => sum + item.quantity, 0) === 1 ? "" : "s"}.`,
                read: false,
                date: new Date(),
              },
            },
          },
        },
      }))
    );

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
