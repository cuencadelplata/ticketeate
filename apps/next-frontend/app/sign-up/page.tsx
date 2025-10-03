'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signUp } from '@/lib/auth-client';
import { toast } from 'sonner';

export default function SignUpPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const { data, isPending } = useSession();
  const isAuthenticated = !!data?.user;
  const isLoading = isPending;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // si ya está logueado, redirige al destino o home
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const back = sp.get('redirect_url') || '/';
      router.replace(back);
    }
  }, [isAuthenticated, isLoading, router, sp]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const back = sp.get('redirect_url') || '/';

    if (!email || !password) {
      toast.error('Completá email y contraseña');
      return;
    }

    // ejemplo de validación mínima local
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setSubmitting(true);

      await signUp.email({
        email,
        password,
        name: email, 
      });

      // redirige
      window.location.href = back;
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'No se pudo crear la cuenta');
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-[70vh] flex items-center justify-center p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm bg-white dark:bg-zinc-900"
      >
        <h1 className="text-2xl font-semibold">Crear cuenta</h1>

        <label className="block space-y-1">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">Email</span>
          <input
            type="email"
            autoComplete="email"
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">Contraseña</span>
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              autoComplete="new-password"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 pr-16 outline-none focus:ring-2 focus:ring-orange-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded bg-zinc-200/70 dark:bg-zinc-700/60"
            >
              {showPwd ? 'Ocultar' : 'Ver'}
            </button>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Mínimo 6 caracteres. Podés cambiarla luego.
          </p>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-orange-600 hover:bg-orange-700 text-white py-2 transition disabled:opacity-60"
        >
          {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>

        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          ¿Ya tenés cuenta?{' '}
          <Link
            href={`/sign-in?redirect_url=${encodeURIComponent(sp.get('redirect_url') || '/')}`}
            className="hover:underline text-orange-600 dark:text-orange-400"
          >
            Iniciá sesión
          </Link>
        </div>
      </form>
    </main>
  );
}
