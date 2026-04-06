import connectDB from "@/config/db";
import { serializeProductForClient } from "@/lib/productRating";
import { getRequestAuth } from "@/lib/requestAuth";
import Product from "@/models/Product";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { userId } = await getRequestAuth(request);

        await connectDB()

        const { searchParams } = new URL(request.url)
        const rawLimit = parseInt(searchParams.get('limit') || '', 10)
        const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : 1000
        const page = parseInt(searchParams.get('page')) || 1
        const skip = (page - 1) * limit

        const [productDocuments, total] = await Promise.all([
            Product.find({})
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Product.estimatedDocumentCount(),
        ])

        const sellerIds = [...new Set(productDocuments.map((product) => product.userId).filter(Boolean))]
        const sellers = sellerIds.length
            ? await User.find({ _id: { $in: sellerIds } })
                .select("_id name businessName businessLocation sellerRatingSummary sellerSubscriptionStatus")
                .lean()
            : []

        const sellerMap = new Map(sellers.map((seller) => [String(seller._id), seller]))

        const products = productDocuments.map((product) => {
            const seller = sellerMap.get(String(product.userId))

            return {
                ...serializeProductForClient(product, userId),
                sellerProfile: seller ? {
                    id: String(seller._id),
                    name: seller.businessName || seller.name || "Seller",
                    location: seller.businessLocation || product.sellerLocation || "",
                    ratingSummary: seller.sellerRatingSummary || {
                        totalReviews: 0,
                        reliability: 0,
                        speed: 0,
                        communication: 0,
                        overall: 0,
                    },
                    subscriptionStatus: seller.sellerSubscriptionStatus || "active",
                } : null,
            }
        });

        const response = NextResponse.json({
            success: true,
            products,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        })

        // Add cache headers for better performance
        response.headers.set(
            'Cache-Control',
            userId ? 'private, no-store' : 'public, s-maxage=300, stale-while-revalidate=600'
        )

        return response

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message })
    }
}
