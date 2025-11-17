'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, ArrowLeft, Mail } from 'lucide-react';
import { signIn } from '@/lib/auth-client';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): boolean => {
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
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await signIn.email({
        email,
        password,
      });

      // El login fue exitoso, la sesión se actualiza automáticamente
      // La redirección sucede en el componente contenedor (LoginPageContent)
      toast.success('¡Bienvenido!');
    } catch (err: any) {
      console.error('Sign in error:', err);

      let errorMessage = 'Email o contraseña incorrectos';

      if (err?.message) {
        if (
          err.message.includes('Invalid password') ||
          err.message.includes('invalid password') ||
          err.message.includes('Wrong password')
        ) {
          errorMessage = 'Contraseña incorrecta';
        } else if (
          err.message.includes('User not found') ||
          err.message.includes('user not found') ||
          err.message.includes('Email not found')
        ) {
          errorMessage = 'Usuario no encontrado';
        } else if (err.message.includes('Invalid email') || err.message.includes('invalid email')) {
          errorMessage = 'Email inválido';
        }
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await signIn.social({ provider: 'google' });
    } catch (err: any) {
      console.error('Google sign-in failed:', err);
      const errorMessage = 'Error al iniciar sesión con Google';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

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
          <p className="text-stone-400">Inicia sesión en tu cuenta</p>
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
            <form onSubmit={handleSubmit} className="space-y-4">
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
                Iniciar sesión
              </button>

              {/* Password recovery link */}
              <Link
                href="/forgot-password"
                className="block w-full text-center text-xs text-stone-400 hover:text-stone-200 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>

              {/* Sign up link */}
              <div className="text-center text-xs text-stone-400">
                ¿No tienes cuenta?{' '}
                <Link
                  href="/acceso/register"
                  className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
                >
                  Crea una aquí
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
                onClick={handleGoogleSignIn}
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
