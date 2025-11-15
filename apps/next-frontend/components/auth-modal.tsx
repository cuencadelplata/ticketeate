'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Loader2, Mail, Lock, UserCircle } from 'lucide-react';
import { signIn, signUp, useSession } from '@/lib/auth-client';
import { roleToPath } from '@/lib/role-redirect';
import { useSearchParams } from 'next/navigation';

type Role = 'ORGANIZADOR';

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
  const { data: session } = useSession();

  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [role, setRole] = useState<Role>(defaultRole);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    inviteCode: '',
  });
  const [loginAsOrganizer, setLoginAsOrganizer] = useState(false);
  const [loginInviteCode, setLoginInviteCode] = useState('');
  // Inicio de sesión solo con email + contraseña

  // Función para mostrar errores
  const showError = (message: string) => {
    console.log('Setting error:', message);
    setErr(message);
  };

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

  // Funciones helper para manejo del formulario
  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // No limpiar errores automáticamente - dejar que el usuario los vea
  };

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
    updateFormData('email', newEmail);
    if (newEmail.includes('@') && newEmail.includes('.')) {
      const exists = await checkUserExists(newEmail);
      setTab(exists ? 'login' : 'register');
    }
  };

  // Validar
  const validateForm = () => {
    if (!formData.email.trim()) {
      showError('El email es requerido');
      return false;
    }
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      showError('Ingresa un email válido');
      return false;
    }
    if (!formData.password.trim()) {
      showError('La contraseña es requerida');
      return false;
    }
    if (formData.password.length < 6) {
      showError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (tab === 'register' && role === 'ORGANIZADOR' && !formData.inviteCode.trim()) {
      showError('El código de organizador es requerido');
      return false;
    }
    return true;
  };

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErr(null);

    try {
      const result = await signIn.email({
        email: formData.email,
        password: formData.password,
      });

      // Manejar el caso donde no se lanza excepción pero viene { error }
      if ((result as any)?.error) {
        throw new Error((result as any).error?.message || 'Email o contraseña incorrectos');
      }

      // Si llegamos aquí sin excepción, el login fue exitoso
      console.log('Login successful!');

      // Elevar a organizador si corresponde
      if (loginAsOrganizer && loginInviteCode.trim()) {
        try {
          const res = await fetch('/api/auth/assign-role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'ORGANIZADOR', inviteCode: loginInviteCode.trim() }),
          });
          if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            throw new Error(j?.error || 'No se pudo actualizar a organizador');
          }
        } catch (e: any) {
          showError(e?.message || 'No se pudo actualizar a organizador');
        }
      }
    } catch (error: any) {
      console.log('Login failed:', error);

      // Capturar el error y mostrarlo
      let errorMessage = 'Email o contraseña incorrectos';

      if (error?.message) {
        if (
          error.message.includes('Invalid password') ||
          error.message.includes('invalid password') ||
          error.message.includes('Wrong password')
        ) {
          errorMessage = 'Contraseña incorrecta';
        } else if (
          error.message.includes('User not found') ||
          error.message.includes('user not found') ||
          error.message.includes('Email not found')
        ) {
          errorMessage = 'Usuario no encontrado';
        } else if (
          error.message.includes('Invalid email') ||
          error.message.includes('invalid email')
        ) {
          errorMessage = 'Email y contraseña inválidos';
        }
      }

      if (errorMessage === 'Email o contraseña incorrectos') {
        try {
          const exists = await checkUserExists(formData.email);
          errorMessage = exists ? 'Contraseña incorrecta' : 'Usuario no encontrado';
        } catch {}
      }

      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // Sin envío de código de verificación para login

  async function doRegister(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErr(null);

    try {
      await signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.email,
      });

      // ORGANIZADOR requiere código
      const res = await fetch('/api/auth/assign-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, inviteCode: formData.inviteCode }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'No se pudo asignar el rol');
      }
    } catch (e: any) {
      const errorMessage = e?.message || e?.error || 'Error al crear la cuenta';

      if (
        errorMessage.includes('User already exists') ||
        errorMessage.includes('already exists') ||
        errorMessage.includes('Email already in use')
      ) {
        showError('Ya existe una cuenta con este email');
      } else if (
        errorMessage.includes('Invalid invite code') ||
        errorMessage.includes('inválido') ||
        errorMessage.includes('Invalid code')
      ) {
        showError('Código de invitación inválido');
      } else if (
        errorMessage.includes('Weak password') ||
        errorMessage.includes('Password too weak')
      ) {
        showError('La contraseña es muy débil');
      } else if (errorMessage.includes('Invalid email')) {
        showError('Ingresa un email válido');
      } else {
        showError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }

  // Indicador de fortaleza de contraseña
  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: '', color: '' };
    if (password.length < 6) return { strength: 1, text: 'Muy débil', color: 'text-red-400' };
    if (password.length < 8) return { strength: 2, text: 'Débil', color: 'text-orange-400' };
    if (password.length < 12) return { strength: 3, text: 'Buena', color: 'text-yellow-400' };
    return { strength: 4, text: 'Fuerte', color: 'text-green-400' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const inviteRequired = role === 'ORGANIZADOR';
  const isFormValid =
    formData.email.trim() &&
    formData.password.trim() &&
    formData.password.length >= 6 &&
    (!inviteRequired || formData.inviteCode.trim());

  const disableSubmit = loading || !isFormValid;

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        // No permitir cerrar el modal hasta que esté autenticado como ORGANIZADOR
        return;
      }}
    >
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
            <div className="mb-3 rounded-md bg-red-500/20 border border-red-500/30 px-3 py-2 text-sm text-red-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-red-400">⚠️</span>
                  <span>{err}</span>
                </div>
                <button
                  onClick={() => setErr(null)}
                  className="text-red-400 hover:text-red-300 text-lg leading-none"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* REGISTER */}
          {tab === 'register' && (
            <form onSubmit={doRegister} className="space-y-3">
              {/* Role selector */}
              <div className="grid grid-cols-1 gap-2">
                {(['ORGANIZADOR'] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-xl border p-3 text-left text-sm ${
                      role === r ? 'border-orange-500 ring-2 ring-orange-200' : 'border-stone-700'
                    }`}
                  >
                    <div className="font-semibold">Organizador</div>
                    <div className="text-xs text-stone-400">
                      Crea y gestiona eventos (requiere código de organizador)
                    </div>
                  </button>
                ))}
              </div>

              {/* Invite code */}
              {inviteRequired && (
                <div className="space-y-1">
                  <label className="text-xs text-stone-400">Código de organizador</label>
                  <input
                    value={formData.inviteCode}
                    onChange={(e) => updateFormData('inviteCode', e.target.value)}
                    placeholder="Ingresa tu código de organizador"
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm outline-none focus:border-orange-500"
                  />
                  <p className="text-xs text-stone-500">Requerido para crear eventos.</p>
                </div>
              )}

              <div className="space-y-2">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
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
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 pl-9 pr-3 py-2 text-sm outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {formData.password && tab === 'register' && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-stone-700 rounded-full h-1">
                      <div
                        className={`h-1 rounded-full transition-all duration-300 ${
                          passwordStrength.strength === 1
                            ? 'bg-red-400 w-1/4'
                            : passwordStrength.strength === 2
                              ? 'bg-orange-400 w-1/2'
                              : passwordStrength.strength === 3
                                ? 'bg-yellow-400 w-3/4'
                                : passwordStrength.strength === 4
                                  ? 'bg-green-400 w-full'
                                  : 'w-0'
                        }`}
                      />
                    </div>
                    <span className={`text-xs ${passwordStrength.color}`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                </div>
              )}

              <button
                disabled={disableSubmit}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Continuar
              </button>

              <button
                type="button"
                className="block w-full text-center text-xs text-stone-400 hover:text-stone-200"
                onClick={() => (window.location.href = '/forgot-password')}
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
                    value={formData.email}
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
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 pl-9 pr-3 py-2 text-sm outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Opción: ingresar como organizador */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-stone-400">
                  <input
                    type="checkbox"
                    checked={loginAsOrganizer}
                    onChange={(e) => setLoginAsOrganizer(e.target.checked)}
                    className="rounded border-stone-600 bg-stone-800 text-orange-500 focus:ring-orange-500 focus:ring-offset-0"
                  />
                  Ingresar como organizador
                </label>
                {loginAsOrganizer && (
                  <input
                    type="text"
                    value={loginInviteCode}
                    onChange={(e) => setLoginInviteCode(e.target.value)}
                    placeholder="Código de organizador"
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm outline-none focus:border-orange-500"
                  />
                )}
              </div>

              <button
                disabled={disableSubmit}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Continuar
              </button>

              <button
                type="button"
                className="block w-full text-center text-xs text-stone-400 hover:text-stone-200"
                onClick={() => (window.location.href = '/forgot-password')}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </form>
          )}

          {/* Google OAuth - Mostrar en ambas pestañas */}
          <div className="px-6 pb-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-stone-900 px-2 text-stone-400">O continúa con</span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                setErr(null);
                try {
                  await signIn.social({ provider: 'google' });
                } catch (error: any) {
                  console.error('Google sign-in failed:', error);
                  showError('Error al iniciar sesión con Google');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-stone-700 bg-stone-800 py-2 text-sm font-medium text-stone-100 hover:bg-stone-700 disabled:opacity-60"
            >
              {loading ? (
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
      </DialogContent>
    </Dialog>
  );
}
