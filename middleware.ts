import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import authAdmin from '@/lib/authAdmin';
import authRider from '@/lib/authRider';
import authSeller from '@/lib/authSeller';

const isAdminRoute = createRouteMatcher(['/admin(.*)', '/api/admin(.*)']);
const isRiderRoute = createRouteMatcher(['/dashboard/rider(.*)', '/api/rider(.*)']);
const isSellerRoute = createRouteMatcher(['/seller(.*)', '/api/product/add(.*)']);

export default clerkMiddleware(async (auth, req) => {
    const authResult = await auth();
    const { userId, sessionClaims } = authResult;
    const role = userId ? ((sessionClaims?.publicMetadata as any)?.role || (sessionClaims?.metadata as any)?.role) : undefined;

    const hasAdminAccess = userId ? await authAdmin(userId) : false;
    const hasRiderAccess = userId ? await authRider(userId) : false;
    const hasSellerAccess = userId ? await authSeller(userId) : false;

    console.log('Middleware Debug:', {
        userId,
        role,
        hasAdminAccess,
        hasRiderAccess,
        hasSellerAccess,
        path: req.nextUrl.pathname,
        sessionClaims: !!sessionClaims,
        isSellerRoute: isSellerRoute(req)
    });

    if (isAdminRoute(req) && !hasAdminAccess) {
        console.log('Blocking admin access');
        return NextResponse.redirect(new URL('/', req.url));
    }

    if (isRiderRoute(req) && !hasRiderAccess) {
        console.log('Blocking rider access');
        return NextResponse.redirect(new URL('/', req.url));
    }

    if (isSellerRoute(req) && !hasSellerAccess) {
        console.log('Blocking seller access');
        return NextResponse.redirect(new URL('/', req.url));
    }
});

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};
