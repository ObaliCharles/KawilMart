import { getRequestUserId } from "@/lib/requestAuth";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import authRider from "@/lib/authRider";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Address from "@/models/Address";
import User from "@/models/User";
import { getUserRole } from "@/lib/userRoleCache";
import {
    createStatusNotification,
    createStatusTrackingEvent,
    ensureTrackingEvents,
    serializeTrackingEvents,
} from "@/lib/orderTracking";
import { notifyUsers } from "@/lib/notifyUsers";

const formatDropLocation = (address) => {
    if (!address) {
        return "";
    }

    return [address.area, address.city, address.state].filter(Boolean).join(", ");
};

const sanitizeItem = (item) => ({
    quantity: item.quantity,
    price: item.price,
    product: item.product
        ? {
            _id: String(item.product._id),
            name: item.product.name,
            image: item.product.image || [],
            location: item.product.location || "",
            sellerContact: item.product.sellerContact || "",
            sellerLocation: item.product.sellerLocation || "",
        }
        : null,
});

export async function GET(request) {
    try {
        const userId = await getRequestUserId(request);
        const isRider = await authRider(userId);
        if (!isRider) return NextResponse.json({ success: false, message: "Unauthorized" });

        await connectDB();
        const role = await getUserRole(userId);
        const baseFilter = {
            status: {
                $in: [
                    'Order Placed',
                    'Confirmed',
                    'Preparing',
                    'Processing',
                    'Ready for Delivery',
                    'Shipped',
                    'Out for Delivery',
                    'Delivered',
                ]
            }
        };

        const deliveries = await Order.find(
            role === 'admin'
                ? baseFilter
                : { ...baseFilter, riderId: userId }
        )
            .populate({ path: "items.product", model: Product })
            .populate({ path: "address", model: Address })
            .sort({ date: -1 })
            .lean();

        const sellerIds = [...new Set(deliveries.map((delivery) => delivery.sellerId).filter(Boolean))];
        const sellers = sellerIds.length
            ? await User.find({ _id: { $in: sellerIds } })
                .select("_id name phoneNumber businessName businessLocation")
                .lean()
            : [];

        const sellerMap = new Map(sellers.map((seller) => [String(seller._id), seller]));

        const deliverySummaries = deliveries.map((delivery) => {
            const seller = sellerMap.get(String(delivery.sellerId));
            const products = delivery.items
                .map((item) => item.product)
                .filter(Boolean);
            const firstProduct = products[0] || null;
            const pickupStops = [...new Set(products.map((product) => product.location).filter(Boolean))];
            const totalItems = delivery.items.reduce((sum, item) => sum + item.quantity, 0);

            return {
                ...delivery,
                items: delivery.items.map(sanitizeItem),
                totalItems,
                seller: {
                    id: delivery.sellerId || "",
                    name: seller?.businessName || seller?.name || "Seller",
                    phoneNumber: seller?.phoneNumber || firstProduct?.sellerContact || "",
                    businessLocation: seller?.businessLocation || firstProduct?.sellerLocation || firstProduct?.location || "",
                },
                pickup: {
                    location: seller?.businessLocation || firstProduct?.sellerLocation || firstProduct?.location || "",
                    phoneNumber: seller?.phoneNumber || firstProduct?.sellerContact || "",
                    stops: pickupStops,
                },
                dropoff: {
                    customerName: delivery.address?.fullName || "",
                    phoneNumber: delivery.address?.phoneNumber || delivery.customerPhone || "",
                    location: formatDropLocation(delivery.address),
                    area: delivery.address?.area || "",
                    city: delivery.address?.city || "",
                    state: delivery.address?.state || "",
                },
                estimatedCommission: (delivery.amount || 0) * 0.05,
                trackingEvents: serializeTrackingEvents(ensureTrackingEvents(delivery)),
            };
        });

        return NextResponse.json({ success: true, deliveries: deliverySummaries });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}

export async function PUT(request) {
    try {
        const userId = await getRequestUserId(request);
        const isRider = await authRider(userId);
        if (!isRider) return NextResponse.json({ success: false, message: "Unauthorized" });
        const role = await getUserRole(userId);

        const { orderId, status } = await request.json();
        const allowedStatuses = ['Out for Delivery', 'Delivered'];
        if (!allowedStatuses.includes(status)) {
            return NextResponse.json({ success: false, message: "Riders can only mark Out for Delivery or Delivered" });
        }

        await connectDB();
        const order = await Order.findById(orderId);
        if (!order) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }

        if (role !== 'admin' && order.riderId !== userId) {
            return NextResponse.json({ success: false, message: "This delivery is not assigned to you" }, { status: 403 });
        }

        if (order.status !== status) {
            order.status = status;
            order.trackingEvents = [
                ...(order.trackingEvents || []),
                createStatusTrackingEvent(status),
            ];
            await order.save();

            const notification = createStatusNotification(status, order._id);
            await notifyUsers([
                {
                    userId: order.userId,
                    notification,
                    emailTitle: notification.title,
                    emailMessage: notification.message,
                    ctaLabel: "Track order",
                    ctaPath: "/my-orders",
                },
            ]);
        }

        return NextResponse.json({ success: true, message: `Marked as ${status}` });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
