import { getRequestUserId } from "@/lib/requestAuth";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Address from "@/models/Address"; // Import so Mongoose registers the model
import User from "@/models/User";
import { ensureTrackingEvents, serializeTrackingEvents } from "@/lib/orderTracking";

const sanitizeProduct = (product) => {
  if (!product) {
    return null;
  }

  return {
    _id: String(product._id),
    name: product.name,
    image: product.image || [],
    location: product.location || "",
    sellerContact: product.sellerContact || "",
    sellerLocation: product.sellerLocation || "",
  };
};

export async function GET(request) {
  try {
    // Get the logged-in userId
    const userId = await getRequestUserId(request);
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
      .sort({ date: -1 })
      .lean();

    const relatedUserIds = [...new Set(
      orders.flatMap((order) => [order.sellerId, order.riderId].filter(Boolean))
    )];

    const relatedUsers = relatedUserIds.length
      ? await User.find({ _id: { $in: relatedUserIds } })
        .select("_id name phoneNumber businessName businessLocation imageUrl")
        .lean()
      : [];

    const relatedUsersMap = new Map(relatedUsers.map((account) => [String(account._id), account]));

    const serializedOrders = orders.map((order) => {
      const seller = relatedUsersMap.get(String(order.sellerId));
      const rider = order.riderId ? relatedUsersMap.get(String(order.riderId)) : null;
      const trackingEvents = serializeTrackingEvents(ensureTrackingEvents(order));
      const firstProduct = order.items.find((item) => item.product)?.product || null;

      return {
        _id: String(order._id),
        userId: String(order.userId),
        sellerId: String(order.sellerId),
        riderId: order.riderId ? String(order.riderId) : "",
        items: (order.items || []).map((item) => ({
          quantity: item.quantity,
          price: item.price,
          product: sanitizeProduct(item.product),
        })),
        amount: order.amount,
        status: order.status,
        paymentStatus: order.paymentStatus || "Pending",
        deliveryRequired: Boolean(order.deliveryRequired),
        deliveryFee: order.deliveryFee || 0,
        customerPhone: order.customerPhone || "",
        date: order.date,
        address: order.address ? {
          fullName: order.address.fullName,
          phoneNumber: order.address.phoneNumber,
          area: order.address.area,
          city: order.address.city,
          state: order.address.state,
          pincode: order.address.pincode,
        } : null,
        seller: seller ? {
          id: String(seller._id),
          name: seller.businessName || seller.name || "Seller",
          phoneNumber: seller.phoneNumber || "",
          location: seller.businessLocation || "",
          imageUrl: seller.imageUrl || "",
        } : {
          id: String(order.sellerId),
          name: "Seller",
          phoneNumber: firstProduct?.sellerContact || "",
          location: firstProduct?.sellerLocation || firstProduct?.location || "",
          imageUrl: "",
        },
        rider: rider ? {
          id: String(rider._id),
          name: rider.name || "Rider",
          phoneNumber: rider.phoneNumber || "",
          imageUrl: rider.imageUrl || "",
        } : null,
        trackingEvents,
      };
    });

    return NextResponse.json({ success: true, orders: serializedOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ success: false, message: error.message });
  }
}
