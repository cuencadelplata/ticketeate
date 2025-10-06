'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Loader2, Mail, Lock, UserCircle } from 'lucide-react';
import { signIn, signUp, useSession } from '@/lib/auth-client';
import { roleToPath } from '@/lib/role-redirect';
import { useSearchParams } from 'next/navigation';

type Role = 'ORGANIZADOR' | 'COLABORADOR';

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
  defaultRole = 'ORGANIZADOR',
}: Props) {
  const sp = useSearchParams();
  const redirectUrl = sp.get('redirect_url') || '/';
  const { data: session } = useSession();

  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(defaultRole);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(false);

  useEffect(() => {
    if (session) {
      if (window.location.pathname === '/crear') {
        onClose();
        return;
      }
      
      const r = (session as any).role as Role | undefined;
      const target = sp.get('redirect_url') || roleToPath(r);
      window.location.href = target;
    }
  }, [session, sp, onClose]);

  // unico modal para login y register
  const checkUserExists = async (email: string) => {
    setIsCheckingUser(true);
    try {
      const response = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error('Error checking user:', error);
      return false;
    } finally {
      setIsCheckingUser(false);
    }
  };

  // Detectar automáticamente si es login o registro cuando cambia el email
  const handleEmailChange = async (newEmail: string) => {
    setEmail(newEmail);
    if (newEmail.includes('@') && newEmail.includes('.')) {
      const exists = await checkUserExists(newEmail);
      setTab(exists ? 'login' : 'register');
    }
  };

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      await signIn.email({ email, password });
      // El useEffect se encargará de cerrar el modal o redirigir según la página
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

      // Solo asignar rol si es COLABORADOR (requiere código) o ORGANIZADOR (no requiere código)
      if (role === 'COLABORADOR') {
        // COLABORADOR requiere código de invitación
        const res = await fetch('/api/auth/assign-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, inviteCode }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || 'No se pudo asignar el rol');
        }
      } else if (role === 'ORGANIZADOR') {
        // ORGANIZADOR no requiere código
        const res = await fetch('/api/auth/assign-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role }),
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

  const inviteRequired = role === 'COLABORADOR';
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
              <div className="grid grid-cols-2 gap-2">
                {(['ORGANIZADOR', 'COLABORADOR'] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-xl border p-3 text-left text-sm ${
                      role === r ? 'border-orange-500 ring-2 ring-orange-200' : 'border-stone-700'
                    }`}
                  >
                    <div className="font-semibold">
                      {r === 'ORGANIZADOR' ? 'Organizador' : 'Colaborador'}
                    </div>
                    <div className="text-xs text-stone-400">
                      {r === 'ORGANIZADOR'
                        ? 'Crea y gestiona eventos (sin código requerido)'
                        : 'Escanea entradas y valida tickets (requiere código)'}
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
                  <p className="text-xs text-stone-500">Requerido solo para COLABORADOR.</p>
                </div>
              )}

              <div className="space-y-2">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 pl-9 pr-3 py-2 text-sm outline-none focus:border-orange-500"
                  />
                  {isCheckingUser && (
                    <div className="absolute right-3 top-2.5">
                      <Loader2 className="h-4 w-4 animate-spin text-stone-400" />
                    </div>
                  )}
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
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 pl-9 pr-3 py-2 text-sm outline-none focus:border-orange-500"
                  />
                  {isCheckingUser && (
                    <div className="absolute right-3 top-2.5">
                      <Loader2 className="h-4 w-4 animate-spin text-stone-400" />
                    </div>
                  )}
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
