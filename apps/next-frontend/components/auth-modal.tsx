'use client';

import * as React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Loader2, Mail, Lock, UserCircle } from 'lucide-react';
import { signIn, signUp, useSession } from '@/lib/auth-client';
import { roleToPath } from '@/lib/role-redirect';
import { useSearchParams } from 'next/navigation';

type Role = 'ADMIN' | 'ORGANIZADOR' | 'USUARIO';

type Props = {
  open: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
  defaultRole?: Role;
};

export default function AuthModal({
  open,
  onClose,
  defaultTab = 'login',
  defaultRole = 'USUARIO',
}: Props) {
  const sp = useSearchParams();
  const redirectUrl = sp.get('redirect_url') || '/';
  const { data: session } = useSession();

  const [tab, setTab] = React.useState<'login' | 'register'>(defaultTab);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState<Role>(defaultRole);
  const [inviteCode, setInviteCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  // Si ya hay sesión, redirigir por rol
  React.useEffect(() => {
    if (session) {
      const r = (session as any).role as Role | undefined;
      // si no hay redirect_url, usar destino por rol
      const target = sp.get('redirect_url') || roleToPath(r);
      window.location.href = target;
    }
  }, [session, sp]);

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      await signIn.email({ email, password });
      // dejamos que el effect redirija; si querés forzar:
      // window.location.href = redirectUrl;
    } catch (e: any) {
      setErr(e?.message || 'Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  }

  async function doRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      await signUp.email({ email, password, name: email });

      if (role !== 'USUARIO') {
        const res = await fetch('/api/auth/assign-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, inviteCode }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || 'No se pudo asignar el rol');
        }
      }
    } catch (e: any) {
      setErr(e?.message || 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  }

  const inviteRequired = role !== 'USUARIO';
  const disableRegister = loading || !email || !password || (inviteRequired && !inviteCode.trim());

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
        {/* Header tabs */}
        <div className="grid grid-cols-2">
          <button
            onClick={() => setTab('login')}
            className={`py-3 text-sm font-medium ${
              tab === 'login' ? 'bg-stone-900 text-white' : 'bg-stone-800/50 text-stone-300'
            }`}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => setTab('register')}
            className={`py-3 text-sm font-medium ${
              tab === 'register' ? 'bg-stone-900 text-white' : 'bg-stone-800/50 text-stone-300'
            }`}
          >
            Crear cuenta
          </button>
        </div>

        <div className="px-6 pb-6 pt-4 bg-stone-900 text-stone-100">
          {/* Error */}
          {err && (
            <div className="mb-3 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {err}
            </div>
          )}

          {/* REGISTER */}
          {tab === 'register' && (
            <form onSubmit={doRegister} className="space-y-3">
              {/* Role selector */}
              <div className="grid grid-cols-3 gap-2">
                {(['USUARIO', 'ORGANIZADOR', 'ADMIN'] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-xl border p-3 text-left text-sm ${
                      role === r ? 'border-orange-500 ring-2 ring-orange-200' : 'border-stone-700'
                    }`}
                  >
                    <div className="font-semibold">
                      {r === 'USUARIO' ? 'Usuario' : r === 'ORGANIZADOR' ? 'Organizador' : 'Admin'}
                    </div>
                    <div className="text-xs text-stone-400">
                      {r === 'USUARIO'
                        ? 'Compra/gestiona tus entradas'
                        : r === 'ORGANIZADOR'
                          ? 'Crea y gestiona eventos'
                          : 'Panel administrativo'}
                    </div>
                  </button>
                ))}
              </div>

              {/* Invite code */}
              {inviteRequired && (
                <div className="space-y-1">
                  <label className="text-xs text-stone-400">Código de invitación</label>
                  <input
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="Ingresa tu código"
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm outline-none focus:border-orange-500"
                  />
                  <p className="text-xs text-stone-500">Requerido para ORGANIZADOR/ADMIN.</p>
                </div>
              )}

              <div className="space-y-2">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 pl-9 pr-3 py-2 text-sm outline-none focus:border-orange-500"
                  />
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 pl-9 pr-3 py-2 text-sm outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <button
                disabled={disableRegister}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Continuar
              </button>

              <button
                type="button"
                className="block w-full text-center text-xs text-stone-400 hover:text-stone-200"
                onClick={() => alert('Manda un correo a soporte para recuperar tu contraseña.')}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </form>
          )}

          {/* LOGIN */}
          {tab === 'login' && (
            <form onSubmit={doLogin} className="space-y-3">
              <div className="space-y-2">
                <div className="relative">
                  <UserCircle className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 pl-9 pr-3 py-2 text-sm outline-none focus:border-orange-500"
                  />
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 pl-9 pr-3 py-2 text-sm outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <button
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Continuar
              </button>

              <button
                type="button"
                className="block w-full text-center text-xs text-stone-400 hover:text-stone-200"
                onClick={() => alert('Manda un correo a soporte para recuperar tu contraseña.')}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
