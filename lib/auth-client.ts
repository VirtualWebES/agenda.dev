import { createAuthClient } from "better-auth/react";
import { stripeClient } from "@better-auth/stripe/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_BASE_URL,
  plugins: [
    // Enable Stripe subscription management in the client
    stripeClient({ subscription: true }),
  ],
});

// Export commonly used methods and subscription actions
export const { signIn, signUp, useSession, signOut, subscription } = authClient; 