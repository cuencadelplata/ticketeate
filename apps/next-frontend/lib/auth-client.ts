'use client';

import { createAuthClient } from 'better-auth/react';
import { customSessionClient } from 'better-auth/client/plugins';
import type { auth } from './auth';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
  plugins: [customSessionClient<typeof auth>()],
});

export const {
  useSession, // hook: { data, isAuthenticated, isLoading, error }
  signIn, // signIn.email({ email, password })
  signUp, // signUp.email({ email, password })
  signOut, // cierra la sesion actual
} = authClient;
