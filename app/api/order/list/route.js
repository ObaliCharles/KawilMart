import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Address from "@/models/Address"; // Import so Mongoose registers the model

export async function GET(request) {
  try {
    // Get the logged-in userId
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: "User not authenticated" });
    }

    // Connect to MongoDB
    await connectDB();

    // Fetch orders for this user and populate product and address details
    const orders = await Order.find({ userId })
      .populate({
        path: "items.product",
        model: Product // ensures correct model reference
      })
      .populate({
        path: "address",
        model: Address // ensures correct model reference
      })
      .sort({ date: -1 }); // optional: latest orders first

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ success: false, message: error.message });
  }
}
