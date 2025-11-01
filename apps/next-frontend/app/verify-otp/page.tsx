'use client';

import { useState, useEffect, Suspense } from 'react';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import { sendVerificationOTP, verifyEmail } from '@/lib/auth-client';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function VerifyOTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');

  const [email, setEmail] = useState(emailParam || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setError(null);
    setSending(true);

    if (!email.trim()) {
      setError('El email es requerido');
      setSending(false);
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Ingresa un email válido');
      setSending(false);
      return;
    }

    try {
      const result = await sendVerificationOTP({
        email,
        type: 'email-verification',
      });
      
      if (result.error) {
        throw new Error(result.error.message || 'Error al enviar el código');
      }
      
      setOtpSent(true);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err?.message || 'Error al enviar el código. Intenta nuevamente.');
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!otp.trim()) {
      setError('El código es requerido');
      setLoading(false);
      return;
    }

    try {
      const result = await verifyEmail({
        email,
        otp,
      });
      
      if (result.error) {
        throw new Error(result.error.message || 'Código inválido o expirado');
      }
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/sign-in');
      }, 2000);
    } catch (err: any) {
      console.error('Error:', err);
      let errorMessage = 'Código incorrecto o expirado';
      
      if (err?.message?.includes('expired') || err?.message?.includes('TOO_MANY_ATTEMPTS')) {
        errorMessage = 'El código ha expirado o excediste los intentos. Solicita uno nuevo.';
      } else if (err?.message?.includes('invalid')) {
        errorMessage = 'Código inválido. Verifica e intenta nuevamente.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">¡Email verificado!</h2>
            <p className="mt-3 text-sm text-gray-600">
              Tu email ha sido verificado exitosamente.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Serás redirigido al inicio de sesión...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!otpSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Verificar Email</h2>
            <p className="mt-2 text-sm text-gray-600">
              Ingresa tu email para recibir un código de verificación
            </p>
          </div>

          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  disabled={sending}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={sending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando código...
                </>
              ) : (
                'Enviar código de verificación'
              )}
            </button>
          </form>

          <div className="text-center">
            <Link
              href="/sign-in"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Ingresa el código</h2>
          <p className="mt-2 text-sm text-gray-600">
            Hemos enviado un código de 6 dígitos a <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
              Código de verificación
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              maxLength={6}
              className="mt-1 w-full rounded-lg border border-gray-300 py-2.5 px-4 text-center text-2xl font-bold tracking-widest focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              disabled={loading}
              autoComplete="off"
            />
            <p className="mt-1 text-xs text-gray-500">El código expira en 10 minutos</p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              'Verificar código'
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSendOTP()}
            disabled={sending}
            className="w-full text-sm text-gray-600 hover:text-gray-900"
          >
            {sending ? 'Enviando...' : '¿No recibiste el código? Enviar nuevamente'}
          </button>
        </form>

        <div className="text-center">
          <Link
            href="/sign-in"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <VerifyOTPForm />
    </Suspense>
  );
}
