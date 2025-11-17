'use client';

import { useState, useRef } from 'react';
import { Loader2, Lock, ArrowLeft, Mail } from 'lucide-react';
import { signUp, sendVerificationOTP, emailOtp, authClient } from '@/lib/auth-client';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

type Role = 'USUARIO' | 'ORGANIZADOR' | 'COLABORADOR';

interface PendingRole {
  role: Role;
  inviteCode?: string;
}

export function SignUpForm() {
  const pendingRoleRef = useRef<PendingRole | null>(null);

  // States for registration form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('USUARIO');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States for OTP verification
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const getRoleDisplayName = (role: Role): string => {
    const names: Record<Role, string> = {
      USUARIO: 'Usuario',
      ORGANIZADOR: 'Organizador',
      COLABORADOR: 'Colaborador',
    };
    return names[role];
  };

  const getRoleDescription = (role: Role): string => {
    const descriptions: Record<Role, string> = {
      USUARIO: 'Compra entradas y disfruta eventos',
      ORGANIZADOR: 'Crea y gestiona tus eventos',
      COLABORADOR: 'Colabora en eventos (requiere invitación)',
    };
    return descriptions[role];
  };

  const inviteRequired = selectedRole === 'COLABORADOR';

  const validateRegistrationForm = (): boolean => {
    if (!email.trim()) {
      setError('El email es requerido');
      return false;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Ingresa un email válido');
      return false;
    }
    if (!password.trim()) {
      setError('La contraseña es requerida');
      return false;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (inviteRequired && !inviteCode.trim()) {
      setError('El código de invitación es requerido para COLABORADOR');
      return false;
    }
    return true;
  };

  const validateOtpForm = (): boolean => {
    if (otp.length !== 6) {
      setError('Ingresa el código de 6 dígitos');
      return false;
    }
    return true;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateRegistrationForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await signUp.email({
        email,
        password,
        name: email,
      });

      // Verificar si hubo error en el registro
      if (!result || (result as any).error) {
        throw new Error((result as any)?.error?.message || 'Error al crear la cuenta');
      }

      // Guardar rol pendiente
      pendingRoleRef.current = {
        role: selectedRole,
        ...(inviteRequired && { inviteCode: inviteCode.trim() }),
      };

      // Mostrar formulario de OTP
      setShowOtpForm(true);
      setResendCooldown(60);
      toast.success('Te enviamos un código de verificación. Revisa tu correo.');
    } catch (err: any) {
      const errorMessage = err?.message || err?.error || 'Error al crear la cuenta';

      if (
        errorMessage.includes('User already exists') ||
        errorMessage.includes('already exists') ||
        errorMessage.includes('Email already in use')
      ) {
        setError('Ya existe una cuenta con este email');
      } else if (
        errorMessage.includes('Invalid invite code') ||
        errorMessage.includes('inválido') ||
        errorMessage.includes('Invalid code')
      ) {
        setError('Código de invitación inválido');
      } else if (
        errorMessage.includes('Weak password') ||
        errorMessage.includes('Password too weak')
      ) {
        setError('La contraseña es muy débil');
      } else if (errorMessage.includes('Invalid email')) {
        setError('Ingresa un email válido');
      } else {
        setError(errorMessage);
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateOtpForm()) {
      return;
    }

    setOtpLoading(true);

    try {
      // Verificar OTP
      const result = await emailOtp.verifyEmail({
        email,
        otp,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Código inválido o expirado');
      }

      // Email verificado exitosamente
      console.log('Email verificado exitosamente');

      // Asignar rol si es necesario
      if (pendingRoleRef.current) {
        try {
          const payload: Record<string, string> = { role: pendingRoleRef.current.role };
          if (pendingRoleRef.current.role === 'COLABORADOR' && pendingRoleRef.current.inviteCode) {
            payload.inviteCode = pendingRoleRef.current.inviteCode;
          }

          const res = await fetch('/api/auth/assign-role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            throw new Error(j?.error || 'No se pudo asignar el rol');
          }
        } catch (roleError: any) {
          console.error('Error asignando rol:', roleError);
          toast.error(roleError?.message || 'No se pudo asignar el rol. Contacta soporte.');
        } finally {
          pendingRoleRef.current = null;
        }
      }

      // Refresh session para sincronizar todo
      await authClient.getSession();

      toast.success('¡Cuenta creada exitosamente!');
      // La redirección sucede en el componente contenedor (RegisterPageContent)
    } catch (err: any) {
      console.error('OTP verification error:', err);
      const errorMessage = err?.message || 'Error al verificar el código';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) {
      setError(`Espera ${resendCooldown} segundos antes de reenviar`);
      return;
    }

    try {
      const result = await sendVerificationOTP({
        email,
        type: 'email-verification',
      });

      if (result.error) {
        setError('Error al enviar el código. Intenta nuevamente.');
      } else {
        setResendCooldown(60);
        toast.success('Código reenviado a tu email');
      }
    } catch (error: any) {
      console.error('Error resending OTP:', error);
      setError('Error al enviar el código. Intenta nuevamente.');
    }
  };

  // Cooldown timer
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // OTP form
  if (showOtpForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center p-4 relative">
        {/* Imagen de fondo opacada */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(/ticketeate-hero.webp)' }}
        />
        {/* Overlay para mejorar legibilidad */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Botón de volver */}
        <Link
          href="/"
          className="absolute top-6 left-6 flex items-center gap-2 text-stone-400 hover:text-white transition-colors duration-200 z-10"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Volver al inicio</span>
        </Link>

        <div className="w-full max-w-md relative z-10">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <Image
              src="/wordmark-light-alt.png"
              alt="Ticketeate"
              width={200}
              height={48}
              className="mx-auto mb-4"
            />
            <p className="text-stone-400">Verifica tu email</p>
          </div>

          {/* Card */}
          <div className="bg-stone-900 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 pb-6 pt-6 text-stone-100">
              {/* Error */}
              {error && (
                <div className="mb-4 rounded-lg bg-red-500/15 border border-red-500/50 px-4 py-3 text-sm text-red-200 animate-in fade-in duration-300">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-red-400 flex-shrink-0 mt-0.5">●</span>
                      <p className="font-medium text-red-100">{error}</p>
                    </div>
                    <button
                      onClick={() => setError(null)}
                      type="button"
                      className="text-red-400 hover:text-red-300 flex-shrink-0 text-xl leading-none transition-colors"
                      aria-label="Cerrar error"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              <p className="text-stone-400 text-sm mb-6">
                Enviamos un código a <span className="font-semibold text-stone-200">{email}</span>
              </p>

              {/* OTP Form */}
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {/* OTP Input */}
                <div className="space-y-1">
                  <label className="text-xs text-stone-400">Código de verificación</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setError(null);
                    }}
                    placeholder="000000"
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-center font-mono text-2xl tracking-widest outline-none focus:border-orange-500 transition-colors"
                  />
                  <p className="text-xs text-stone-500">Ingresa el código de 6 dígitos</p>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={otpLoading || otp.length !== 6}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60 transition-colors"
                >
                  {otpLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Verificar código
                </button>

                {/* Resend link */}
                <div className="text-center text-xs">
                  {resendCooldown > 0 ? (
                    <p className="text-stone-500">Reenviar código en {resendCooldown}s</p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
                    >
                      ¿No recibiste el código? Reenviar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-stone-400 text-sm">
              ¿Necesitas ayuda?{' '}
              <a
                href="mailto:soporte@ticketeate.com"
                className="text-orange-400 hover:text-orange-300"
              >
                Contacta soporte
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Registration form
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center p-4 relative">
      {/* Imagen de fondo opacada */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: 'url(/ticketeate-hero.webp)' }}
      />
      {/* Overlay para mejorar legibilidad */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Botón de volver */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-stone-400 hover:text-white transition-colors duration-200 z-10"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Volver al inicio</span>
      </Link>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Image
            src="/wordmark-light-alt.png"
            alt="Ticketeate"
            width={200}
            height={48}
            className="mx-auto mb-4"
          />
          <p className="text-stone-400">Crea tu cuenta</p>
        </div>

        {/* Card */}
        <div className="bg-stone-900 rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-6 pb-6 pt-6 text-stone-100">
            {/* Error */}
            {error && (
              <div className="mb-4 rounded-lg bg-red-500/15 border border-red-500/50 px-4 py-3 text-sm text-red-200 animate-in fade-in duration-300">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-red-400 flex-shrink-0 mt-0.5">●</span>
                    <p className="font-medium text-red-100">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    type="button"
                    className="text-red-400 hover:text-red-300 flex-shrink-0 text-xl leading-none transition-colors"
                    aria-label="Cerrar error"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Role selector */}
              <div className="space-y-2">
                <label className="text-xs text-stone-400">Tipo de cuenta</label>
                <div className="grid grid-cols-1 gap-2">
                  {(['USUARIO', 'ORGANIZADOR', 'COLABORADOR'] as Role[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setSelectedRole(r);
                        setError(null);
                      }}
                      className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                        selectedRole === r
                          ? 'border-orange-500 bg-orange-500/10 ring-2 ring-orange-200'
                          : 'border-stone-700 hover:border-stone-600'
                      }`}
                    >
                      <div className="font-semibold">{getRoleDisplayName(r)}</div>
                      <div className="text-xs text-stone-400">{getRoleDescription(r)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Invite code - only for COLABORADOR */}
              {inviteRequired && (
                <div className="space-y-1">
                  <label className="text-xs text-stone-400">Código de invitación</label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => {
                      setInviteCode(e.target.value);
                      setError(null);
                    }}
                    placeholder="Ingresa tu código"
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm outline-none focus:border-orange-500 transition-colors"
                  />
                  <p className="text-xs text-stone-500">Requerido solo para colaboradores</p>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs text-stone-400">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    placeholder="tu@email.com"
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 pl-9 pr-3 py-2 text-sm outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs text-stone-400">Contraseña</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 pl-9 pr-3 py-2 text-sm outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60 transition-colors"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Continuar
              </button>

              {/* Sign in link */}
              <div className="text-center text-xs text-stone-400">
                ¿Ya tienes cuenta?{' '}
                <Link
                  href="/acceso/login"
                  className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
                >
                  Inicia sesión aquí
                </Link>
              </div>
            </form>

            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-700" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-stone-900 px-2 text-stone-400">O continúa con</span>
                </div>
              </div>

              {/* Google button */}
              <button
                type="button"
                onClick={async () => {
                  setGoogleLoading(true);
                  setError(null);
                  try {
                    const { signUp } = await import('@/lib/auth-client');
                    await signUp.social({ provider: 'google' });
                  } catch (error: any) {
                    console.error('Google sign-up failed:', error);
                    const errorMessage = 'Error al crear cuenta con Google';
                    setError(errorMessage);
                    toast.error(errorMessage);
                  } finally {
                    setGoogleLoading(false);
                  }
                }}
                disabled={googleLoading || loading}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-stone-700 bg-stone-800 py-2 text-sm font-medium text-stone-100 hover:bg-stone-700 disabled:opacity-60 transition-colors"
              >
                {googleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                Continuar con Google
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-stone-400 text-sm">
            ¿Necesitas ayuda?{' '}
            <a
              href="mailto:soporte@ticketeate.com"
              className="text-orange-400 hover:text-orange-300"
            >
              Contacta soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
