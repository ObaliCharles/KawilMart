import connectDB from "@/config/db";
import { serializeProductForClient } from "@/lib/productRating";
import { getRequestAuth } from "@/lib/requestAuth";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { userId } = await getRequestAuth(request);

        await connectDB()

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit')) || 20
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

        const products = productDocuments.map((product) =>
            serializeProductForClient(product, userId)
        );

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
