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
  signIn, // signIn.email({ email, password }), signIn.social({ provider: 'google' })
  signUp, // signUp.email({ email, password })
  signOut, // cierra la sesion actual
  updateUser, // actualizar datos del usuario
} = authClient;
