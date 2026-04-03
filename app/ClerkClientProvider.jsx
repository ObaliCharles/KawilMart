'use client'

import { ClerkProvider } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function ClerkClientProvider({ children }) {
  const router = useRouter();

  const frontendApi = process.env.NEXT_PUBLIC_CLERK_FRONTEND_API;
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!frontendApi || !publishableKey) {
    console.error('Clerk env vars missing:', { frontendApi, publishableKey });
    // For dev, this helps avoid infinite fallback state when Clerk cannot load
    // make sure your .env has FRONTEND_API from Clerk dashboard, not the publishable key.
  }

  return (
    <ClerkProvider
      frontendApi={frontendApi}
      publishableKey={publishableKey}
      navigate={(to) => router.push(to)}
      // optional fallback URLs, adjust to your flow
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}
