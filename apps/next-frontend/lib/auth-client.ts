"use client";

import { createAuthClient } from "better-auth/react";


export const authClient = createAuthClient();

export const {
  useSession, // hook: { data, isAuthenticated, isLoading, error }
  signIn,     // signIn.email({ email, password })
  signUp,     // signUp.email({ email, password })
  signOut,    // cierra la sesión actual
} = authClient;
