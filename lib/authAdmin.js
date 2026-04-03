import { clerkClient } from '@clerk/nextjs/server';

const authAdmin = async (userId) => {
    try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const role = user.publicMetadata?.role || user.metadata?.role;
        return role === 'admin';
    } catch (error) {
        console.error('Error checking admin access:', error);
        return false;
    }
};

export default authAdmin;
