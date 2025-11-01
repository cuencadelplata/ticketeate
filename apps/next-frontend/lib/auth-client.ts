'use client';

import { createAuthClient } from 'better-auth/react';
import { customSessionClient, emailOTPClient } from 'better-auth/client/plugins';
import type { auth } from './auth';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
  plugins: [customSessionClient<typeof auth>(), emailOTPClient()],
});

export const {
  useSession, // hook: { data, isAuthenticated, isLoading, error }
  signIn, // signIn.email({ email, password }), signIn.social({ provider: 'google' }), signIn.emailOtp({ email, otp })
  signUp, // signUp.email({ email, password })
  signOut, // cierra la sesion actual
  updateUser, // actualizar datos del usuario
  forgetPassword, // forgetPassword.emailOtp({ email })
} = authClient;

// Funciones del plugin emailOTP
export const emailOtp = authClient.emailOtp;

// Alias para compatibilidad con código existente
export const sendVerificationOTP = emailOtp.sendVerificationOtp;
export const verifyEmail = emailOtp.verifyEmail;
export const resetPassword = emailOtp.resetPassword;
export const checkVerificationOtp = emailOtp.checkVerificationOtp;
