'use client';

import { FormEvent, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signIn } from '@/lib/auth-client';
import { toast } from 'sonner';

export default function SignInPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const { data, isPending } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [remember, setRemember] = useState(true);

  // si ya está logueado, redirige al destino
  useEffect(() => {
    if (!isPending && data) {
      const back = sp.get('redirect_url') || '/';
      router.replace(back);
    }
  }, [data, isPending, router, sp]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const back = sp.get('redirect_url') || '/';

    // validación mínima
    if (!email || !password) {
      toast.error('Completá email y contraseña');
      return;
    }

    try {
      setSubmitting(true);
      await signIn.email({
        email,
        password,
        rememberMe: remember,
      });

      // redirige al final para refrescar y cookies
      window.location.href = back;
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'No se pudo iniciar sesión');
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-[70vh] flex items-center justify-center p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm bg-white dark:bg-zinc-900"
      >
        <h1 className="text-2xl font-semibold">Iniciar sesión</h1>

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
              autoComplete="current-password"
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
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Recordarme en este dispositivo
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-orange-600 hover:bg-orange-700 text-white py-2 transition disabled:opacity-60"
        >
          {submitting ? 'Ingresando…' : 'Ingresar'}
        </button>

        <div className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
          <Link
            href={`/sign-up?redirect_url=${encodeURIComponent(sp.get('redirect_url') || '/')}`}
            className="hover:underline text-orange-600 dark:text-orange-400"
          >
            Crear cuenta
          </Link>
          <span className="opacity-70 cursor-not-allowed">¿Olvidaste tu contraseña?</span>
        </div>
      </form>
    </main>
  );
}
