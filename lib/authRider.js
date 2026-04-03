import { clerkClient } from '@clerk/nextjs/server';

const authRider = async (userId) => {
    try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const role = user.publicMetadata?.role || user.metadata?.role;
        return role === 'rider' || role === 'admin';
    } catch (error) {
        console.error('Error checking rider access:', error);
        return false;
    }
};

export default authRider;
