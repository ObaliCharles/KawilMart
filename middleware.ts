import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)', '/api/admin(.*)']);
const isRiderRoute = createRouteMatcher(['/dashboard/rider(.*)', '/api/rider(.*)']);
const isSellerRoute = createRouteMatcher(['/seller(.*)', '/api/product/add(.*)']);

export default clerkMiddleware(async (auth, req) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as any)?.role;

    if (isAdminRoute(req)) {
        if (!userId || role !== 'admin') {
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

    if (isRiderRoute(req)) {
        if (!userId || (role !== 'rider' && role !== 'admin')) {
            return NextResponse.redirect(new URL('/', req.url));
        }
    }
});

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};
