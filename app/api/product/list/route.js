import connectDB from "@/config/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        await connectDB()

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit')) || 20
        const page = parseInt(searchParams.get('page')) || 1
        const skip = (page - 1) * limit

        const products = await Product.find({})
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)

        // For performance, estimate total or remove if not needed
        const total = products.length >= limit ? await Product.countDocuments() : products.length

        const response = NextResponse.json({
            success: true,
            products,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        })

        // Add cache headers for better performance
        response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')

        return response

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message })
    }
}