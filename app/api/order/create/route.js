import connectDB from "@/config/db";
import Product from "@/models/Product";
import Order from "@/models/Order";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { inngest } from "@/config/inngest";

export async function POST(request) {
  try {
    await connectDB();
    const { userId } = getAuth(request);
    const { address, items } = await request.json();

    if (!userId) return NextResponse.json({ success: false, message: "No userId found" });
    if (!address) return NextResponse.json({ success: false, message: "No address provided" });
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: "Cart is empty" });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) continue;
      const price = product.offerPrice || product.price || 0;
      totalAmount += price * item.quantity;
      orderItems.push({
        product: product._id.toString(),
        quantity: item.quantity,
      });
    }

    if (orderItems.length === 0) return NextResponse.json({ success: false, message: "No valid products found" });
    if (totalAmount <= 0) return NextResponse.json({ success: false, message: "Invalid total amount" });

    const finalAmount = Math.floor(totalAmount + totalAmount * 0.02);

    // Create order in MongoDB
    const order = await Order.create({
      userId,
      items: orderItems,
      amount: finalAmount,
      address,
      date: Date.now(),
    });

    console.log("Order created in MongoDB:", order);

    // Clear user cart
    const user = await User.findById(userId);
    if (user) {
      user.cartItems = {};
      await user.save();
    }

    // Send event to Inngest for logging
    await inngest.send({
      name: "order/created",
      data: {
        userId,
        items: orderItems,
        address,
        amount: finalAmount,
        date: order.date,
      },
    });

    return NextResponse.json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    console.error("Order API error:", error);
    return NextResponse.json({ success: false, message: error.message });
  }
}
