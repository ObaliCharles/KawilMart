import { clerkClient } from "@clerk/nextjs/server";

export async function getRequestAuth(request) {
    const client = await clerkClient();
    const requestState = await client.authenticateRequest(request, {
        acceptsToken: "session_token",
    });
    const authObject = requestState.toAuth?.() || null;

    return {
        userId: authObject?.userId || null,
        sessionClaims: authObject?.sessionClaims || null,
        isAuthenticated: !!authObject?.isAuthenticated,
        reason: requestState.reason || null,
        message: requestState.message || null,
    };
}

export async function getRequestUserId(request) {
    const { userId } = await getRequestAuth(request);
    return userId;
}
