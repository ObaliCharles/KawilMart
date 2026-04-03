import authSeller from "@/lib/authSeller";
import { getRequestUserId } from "@/lib/requestAuth";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Address from "@/models/Address"; // ensures Mongoose registers Address
import Order from "@/models/Order"; // ensures Mongoose registers Order
import Product from "@/models/Product"; // ensures Mongoose registers Product

export async function GET(request) {
  try {
    const userId = await getRequestUserId(request);

    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json({ success: false, message: "Unauthorized" });
    }

    await connectDB();

    // Fetch all orders and populate product and address info
    const orders = await Order.find({})
      .populate({
        path: "items.product",
        model: Product
      })
      .populate({
        path: "address",
        model: Address
      })
      .sort({ date: -1 }); // optional: newest first

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    return NextResponse.json({ success: false, message: error.message });
  }
}
