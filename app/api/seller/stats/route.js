import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import { getRequestUserId } from "@/lib/requestAuth";
import Address from "@/models/Address";
import Order from "@/models/Order";
import Product from "@/models/Product";

const getLastSevenDaysRevenue = (orders) => {
  const dayMs = 86400000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfToday = today.getTime();

  return Array.from({ length: 7 }, (_, index) => {
    const start = startOfToday - (6 - index) * dayMs;
    const end = start + dayMs;
    const dayOrders = orders.filter((order) => order.date >= start && order.date < end);

    return {
      day: new Date(start).toLocaleDateString("en-US", { weekday: "short" }),
      revenue: dayOrders.reduce((sum, order) => sum + (order.amount || 0), 0),
      count: dayOrders.length,
    };
  });
};

export async function GET(request) {
  try {
    const userId = await getRequestUserId(request);
    const isSeller = await authSeller(userId);

    if (!isSeller) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const [orders, products] = await Promise.all([
      Order.find({ sellerId: userId })
        .populate({
          path: "address",
          model: Address,
        })
        .sort({ date: -1 }),
      Product.find({ userId }).sort({ date: -1 }),
    ]);

    const totalRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const totalUnitsSold = orders.reduce(
      (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0),
      0
    );

    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const paymentCounts = orders.reduce((acc, order) => {
      const paymentStatus = order.paymentStatus || "Pending";
      acc[paymentStatus] = (acc[paymentStatus] || 0) + 1;
      return acc;
    }, {});

    const categoryBreakdown = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});

    const productLookup = products.reduce((acc, product) => {
      acc[String(product._id)] = product;
      return acc;
    }, {});

    const productPerformance = orders.reduce((acc, order) => {
      order.items.forEach((item) => {
        const productId = String(item.product);
        if (!acc[productId]) {
          acc[productId] = { soldCount: 0, revenue: 0 };
        }

        acc[productId].soldCount += item.quantity || 0;
        acc[productId].revenue += (item.price || 0) * (item.quantity || 0);
      });

      return acc;
    }, {});

    const topProducts = Object.entries(productPerformance)
      .map(([productId, performance]) => {
        const product = productLookup[productId];
        if (!product) {
          return null;
        }

        return {
          _id: product._id,
          name: product.name,
          image: product.image?.[0] || "",
          category: product.category,
          offerPrice: product.offerPrice,
          soldCount: performance.soldCount,
          revenue: performance.revenue,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 5);

    const recentOrders = orders.slice(0, 5).map((order) => ({
      _id: order._id,
      amount: order.amount,
      status: order.status,
      paymentStatus: order.paymentStatus || "Pending",
      date: order.date,
      totalItems: order.items.reduce((sum, item) => sum + (item.quantity || 0), 0),
      customerName: order.address?.fullName || "Customer",
      destination: [order.address?.area, order.address?.city].filter(Boolean).join(", "),
    }));

    const recentProducts = products.slice(0, 4).map((product) => ({
      _id: product._id,
      name: product.name,
      image: product.image?.[0] || "",
      category: product.category,
      offerPrice: product.offerPrice,
      likesCount: product.likesCount || 0,
      averageRating: product.averageRating || 0,
      date: product.date,
    }));

    const averageOrderValue = orders.length ? totalRevenue / orders.length : 0;
    const deliveredOrders = statusCounts.Delivered || 0;
    const cancelledOrders = statusCounts.Cancelled || 0;
    const activeOrders = Math.max(orders.length - deliveredOrders - cancelledOrders, 0);
    const totalLikes = products.reduce((sum, product) => sum + (product.likesCount || 0), 0);
    const averageRating = products.length
      ? products.reduce((sum, product) => sum + (product.averageRating || 0), 0) / products.length
      : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalUnitsSold,
        averageOrderValue,
        deliveredOrders,
        activeOrders,
        pendingPayments: paymentCounts.Pending || 0,
        paidOrders: paymentCounts.Paid || 0,
        totalLikes,
        averageRating,
        statusCounts,
        paymentCounts,
        categoryBreakdown,
        revenueByDay: getLastSevenDaysRevenue(orders),
        topProducts,
        recentOrders,
        recentProducts,
        highlights: {
          bestSellingProduct: topProducts[0]?.name || null,
          latestProduct: recentProducts[0]?.name || null,
          cancellationRate: orders.length ? Math.round((cancelledOrders / orders.length) * 100) : 0,
          deliveryRate: orders.length ? Math.round((deliveredOrders / orders.length) * 100) : 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching seller stats:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
