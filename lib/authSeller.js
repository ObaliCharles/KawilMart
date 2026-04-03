import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const authSeller = async (userId) => {
    try {
        console.log('authSeller called with userId:', userId);
        const client = await clerkClient()
        const user = await client.users.getUser(userId)
        console.log('Clerk user data:', {
            id: user.id,
            publicMetadata: user.publicMetadata,
            metadata: user.metadata
        });
        const role = user.publicMetadata?.role || user.metadata?.role;
        console.log('authSeller check:', { userId, role, hasAccess: role === 'seller' || role === 'admin' });
        return role === 'seller' || role === 'admin';
    } catch (error) {
        console.error('Error checking seller access:', error);
        return false;
    }
};

export default authSeller;