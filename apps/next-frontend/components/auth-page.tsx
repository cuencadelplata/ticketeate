'use client';

import { useEffect, useState, useRef } from 'react';
import { Loader2, Mail, Lock, UserCircle, ArrowLeft } from 'lucide-react';
import {
  signIn,
  signUp,
  useSession,
  sendVerificationOTP,
  emailOtp,
  authClient,
} from '@/lib/auth-client';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

type Role = 'USUARIO' | 'ORGANIZADOR' | 'COLABORADOR';

type Props = {
  defaultTab?: 'login' | 'register';
  defaultRole?: Role;
};

const OTP_FLAG_KEY = 'ticketeate:auth:showOtp';
const OTP_ROLE_KEY = 'ticketeate:auth:pendingRole';
const OTP_EMAIL_KEY = 'ticketeate:auth:pendingEmail';
const OTP_ROLE_SELECTION_KEY = 'ticketeate:auth:selectedRole';

export default function AuthPage({ defaultTab = 'login', defaultRole = 'USUARIO' }: Props) {
  const { data: session } = useSession();
  const showOtpBySessionRef = useRef(false);
  const pendingRoleRef = useRef<{ role: Role; inviteCode?: string } | null>(null);

  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [role, setRole] = useState<Role>(defaultRole);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // Segundos restantes para reenviar
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    inviteCode: '',
  });

  const clearOtpState = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(OTP_FLAG_KEY);
      window.sessionStorage.removeItem(OTP_EMAIL_KEY);
      window.sessionStorage.removeItem(OTP_ROLE_SELECTION_KEY);
      window.sessionStorage.removeItem(OTP_ROLE_KEY);
    }
    showOtpBySessionRef.current = false;
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const shouldShowOtp = window.sessionStorage.getItem(OTP_FLAG_KEY) === 'true';
    const storedEmail = window.sessionStorage.getItem(OTP_EMAIL_KEY);
    const storedRole = window.sessionStorage.getItem(OTP_ROLE_SELECTION_KEY) as Role | null;
    const storedPendingRole = window.sessionStorage.getItem(OTP_ROLE_KEY);

    if (storedPendingRole) {
      try {
        const parsed = JSON.parse(storedPendingRole) as {
          role: Role;
          inviteCode?: string;
        };

        if (parsed?.role) {
          pendingRoleRef.current = parsed;
        }
      } catch (error) {
        console.error('No se pudo restaurar el rol pendiente desde sessionStorage', error);
        pendingRoleRef.current = null;
      }
    }

    if (storedRole && ['USUARIO', 'ORGANIZADOR', 'COLABORADOR'].includes(storedRole)) {
      setRole(storedRole);
    }

    if (storedEmail || pendingRoleRef.current?.inviteCode) {
      const updates: Partial<typeof formData> = {};
      if (storedEmail) {
        updates.email = storedEmail;
      }
      if (pendingRoleRef.current?.inviteCode) {
        updates.inviteCode = pendingRoleRef.current.inviteCode;
      }

      if (Object.keys(updates).length > 0) {
        setFormData((prev) => ({ ...prev, ...updates }));
      }
    }

    if (shouldShowOtp) {
      showOtpBySessionRef.current = true;
      setTab('register');
      setShowOtpVerification(true);
    }
  }, []);

  // Sincronizar OTP con la sesión: si hay sesión sin verificar, mantener OTP visible
  useEffect(() => {
    if (session) {
      const emailVerified = (session.user as any)?.emailVerified;
      // Si está sin verificar y fue por registro, mostrar OTP
      if (!emailVerified && showOtpBySessionRef.current) {
        setShowOtpVerification(true);
      }
    }
  }, [session]);

  // Función para mostrar errores
  const showError = (message: string) => {
    console.log('Setting error:', message);
    setErr(message);
    // También mostrar como toast para más visibilidad
    toast.error(message);
  };

  // Limpiar error cuando cambia el tab
  useEffect(() => {
    setErr(null);
  }, [tab]);

  // Validar email con regex más robusto
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length >= 5;
  };

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
    // Solo hacer check si el email es válido y completo
    if (isValidEmail(newEmail)) {
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
    if (tab === 'register' && role === 'COLABORADOR' && !formData.inviteCode.trim()) {
      showError('El código de invitación es requerido para COLABORADOR');
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
      await signIn.email({
        email: formData.email,
        password: formData.password,
      });

      // Si llegamos aquí sin excepción, el login fue exitoso
      console.log('Login successful!');
      // La sesión se actualiza automáticamente a través de useSession()
      // AccessPageContent detectará emailVerified=true y redirigirá
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
          errorMessage = 'Email inválido';
        }
      }

      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function doRegister(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErr(null);

    try {
      const result = await signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.email,
      });

      // Verificar si hubo error en el registro
      if (!result || (result as any).error) {
        throw new Error((result as any)?.error?.message || 'Error al crear la cuenta');
      }

      // Guardar rol pendiente para asignarlo luego de la verificación OTP
      if (role === 'COLABORADOR') {
        pendingRoleRef.current = {
          role,
          inviteCode: formData.inviteCode.trim(),
        };
      } else if (role === 'ORGANIZADOR') {
        pendingRoleRef.current = { role };
      } else {
        pendingRoleRef.current = null;
      }

      // Mostrar formulario de verificación OTP en la misma página
      setLoading(false);
      showOtpBySessionRef.current = true; // Marcar que necesitamos mostrar OTP
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(OTP_FLAG_KEY, 'true');
        window.sessionStorage.setItem(OTP_EMAIL_KEY, formData.email);
        window.sessionStorage.setItem(OTP_ROLE_SELECTION_KEY, role);
        if (pendingRoleRef.current) {
          window.sessionStorage.setItem(OTP_ROLE_KEY, JSON.stringify(pendingRoleRef.current));
        } else {
          window.sessionStorage.removeItem(OTP_ROLE_KEY);
        }
      }
      setShowOtpVerification(true);
      setResendCooldown(60);
      toast.success('Te enviamos un código de verificación. Revisa tu correo.');

      // No enviar OTP aquí - ya se envió automáticamente por sendVerificationOnSignUp
      // await sendOtpCode();
      return; // Salir para evitar mostrar error
    } catch (e: any) {
      pendingRoleRef.current = null;
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

  // useEffect para el countdown del cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Función para enviar código OTP
  const sendOtpCode = async () => {
    if (resendCooldown > 0) {
      showError(`Espera ${resendCooldown} segundos antes de reenviar`);
      return;
    }

    try {
      setResendingOtp(true);
      setErr(null);

      const result = await sendVerificationOTP({
        email: formData.email,
        type: 'email-verification',
      });

      if (result.error) {
        showError('Error al enviar el código. Intenta nuevamente.');
      } else {
        // Iniciar cooldown de 60 segundos
        setResendCooldown(60);
      }
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      showError('Error al enviar el código. Intenta nuevamente.');
    } finally {
      setResendingOtp(false);
    }
  };

  // Función para verificar código OTP
  const verifyOtpCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      showError('Ingresa el código de 6 dígitos');
      return;
    }

    setOtpLoading(true);
    setErr(null);

    try {
      console.log('Verificando OTP:', { email: formData.email, otp });

      // Usar el método de Better Auth para verificar el OTP
      const result = await emailOtp.verifyEmail({
        email: formData.email,
        otp,
      });

      console.log('Resultado de verificación:', result);

      if (result.error) {
        console.error('Error en verifyEmail:', result.error);
        throw new Error(result.error.message || 'Código inválido o expirado');
      }

      // Email verificado exitosamente
      // La sesión se actualiza automáticamente a través de useSession()
      // AccessPageContent detectará emailVerified=true y redirigirá
      console.log('Email verificado exitosamente');

      const roleToAssign = pendingRoleRef.current;
      if (roleToAssign) {
        try {
          const payload: Record<string, string> = { role: roleToAssign.role };
          if (roleToAssign.role === 'COLABORADOR' && roleToAssign.inviteCode) {
            payload.inviteCode = roleToAssign.inviteCode;
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
          console.error('Error asignando rol luego de verificación:', roleError);
          toast.error(roleError?.message || 'No se pudo asignar el rol. Contacta soporte.');
        } finally {
          pendingRoleRef.current = null;
        }
      }
      pendingRoleRef.current = null;

      // Pequeño delay para asegurar que Better Auth procese completamente la sesión
      // Especialmente importante para cuando se acaba de asignar un rol
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Hacer un refresh de la sesión para sincronizar el rol
      await authClient.getSession();

      // Limpiar la bandera de OTP
      clearOtpState();
      setShowOtpVerification(false);
      setOtp('');
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      let errorMessage = 'Código incorrecto o expirado';

      if (error?.message?.includes('TOO_MANY_ATTEMPTS')) {
        errorMessage = 'Demasiados intentos. Solicita un nuevo código.';
      }

      showError(errorMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  // Indicador de fortaleza de contraseña
  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: '', color: '' };
    if (password.length < 6) return { strength: 1, text: 'Muy débil', color: 'text-red-400' };
    if (password.length < 8) return { strength: 2, text: 'Débil', color: 'text-orange-400' };
    if (password.length < 12) return { strength: 3, text: 'Buena', color: 'text-yellow-400' };
    return { strength: 4, text: 'Fuerte', color: 'text-green-400' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const inviteRequired = role === 'COLABORADOR';
  const isFormValid =
    formData.email.trim() &&
    formData.password.trim() &&
    formData.password.length >= 6 &&
    (!inviteRequired || formData.inviteCode.trim());

  const disableSubmit = loading || !isFormValid;

  const getRoleDescription = (role: Role) => {
    switch (role) {
      case 'USUARIO':
        return 'Compra entradas y participa en eventos';
      case 'ORGANIZADOR':
        return 'Crea y gestiona eventos (sin código requerido)';
      case 'COLABORADOR':
        return 'Escanea entradas y valida tickets (requiere código)';
      default:
        return '';
    }
  };

  const getRoleDisplayName = (role: Role) => {
    switch (role) {
      case 'USUARIO':
        return 'Usuario';
      case 'ORGANIZADOR':
        return 'Organizador';
      case 'COLABORADOR':
        return 'Colaborador';
      default:
        return role;
    }
  };

  // Si está en modo de verificación OTP, mostrar el formulario de OTP
  if (showOtpVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center p-4 relative">
        {/* Imagen de fondo opacada */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(/ticketeate-hero.webp)' }}
        />
        {/* Overlay para mejorar legibilidad */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Verifica tu email</h1>
            <p className="text-stone-400">
              Hemos enviado un código de 6 dígitos a{' '}
              <strong className="text-white">{formData.email}</strong>
            </p>
          </div>

          <div className="bg-stone-900 rounded-2xl p-6 shadow-2xl">
            <form onSubmit={verifyOtpCode} className="space-y-4">
              <div>
                <label className="text-sm text-stone-400 mb-2 block">Código de verificación</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-3 text-center text-2xl font-bold tracking-widest text-white outline-none focus:border-orange-500"
                  disabled={otpLoading}
                  autoComplete="off"
                />
                <p className="mt-2 text-xs text-stone-500">El código expira en 10 minutos</p>
              </div>

              {err && (
                <div className="rounded-lg bg-red-900/20 border border-red-700/50 px-3 py-2 text-sm text-red-400">
                  {err}
                </div>
              )}

              <button
                type="submit"
                disabled={otpLoading || otp.length !== 6}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 py-3 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {otpLoading ? (
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
                onClick={sendOtpCode}
                disabled={resendingOtp || resendCooldown > 0}
                className="w-full text-sm text-stone-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendingOtp
                  ? 'Enviando...'
                  : resendCooldown > 0
                    ? `Reenviar en ${resendCooldown}s`
                    : '¿No recibiste el código? Reenviar'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowOtpVerification(false);
                  setOtp('');
                  setErr(null);
                  clearOtpState();
                  pendingRoleRef.current = null;
                }}
                className="w-full text-sm text-stone-400 hover:text-white"
              >
                Volver atrás
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

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
            className="mx-auto mb-2"
          />
          <p className="text-stone-400">
            {tab === 'login' ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-stone-900 rounded-2xl p-0 overflow-hidden shadow-2xl">
          {/* Header tabs */}
          <div className="grid grid-cols-2">
            <button
              onClick={() => setTab('login')}
              className={`py-3 text-sm font-medium ${
                tab === 'login' ? 'bg-stone-800 text-white' : 'bg-stone-800/50 text-stone-300'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => setTab('register')}
              className={`py-3 text-sm font-medium ${
                tab === 'register' ? 'bg-stone-800 text-white' : 'bg-stone-800/50 text-stone-300'
              }`}
            >
              Crear cuenta
            </button>
          </div>

          <div className="px-6 pb-6 pt-4 bg-stone-900 text-stone-100">
            {/* Error */}
            {err && (
              <div className="mb-4 rounded-lg bg-red-500/15 border border-red-500/50 px-4 py-3 text-sm text-red-200 animate-in fade-in duration-300">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-red-400 flex-shrink-0 mt-0.5">●</span>
                    <div className="flex-1">
                      <p className="font-medium text-red-100">{err}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setErr(null)}
                    type="button"
                    className="text-red-400 hover:text-red-300 flex-shrink-0 text-xl leading-none transition-colors"
                    aria-label="Cerrar error"
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
                  {(['USUARIO', 'ORGANIZADOR', 'COLABORADOR'] as Role[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`rounded-xl border p-3 text-left text-sm ${
                        role === r ? 'border-orange-500 ring-2 ring-orange-200' : 'border-stone-700'
                      }`}
                    >
                      <div className="font-semibold">{getRoleDisplayName(r)}</div>
                      <div className="text-xs text-stone-400">{getRoleDescription(r)}</div>
                    </button>
                  ))}
                </div>

                {/* Invite code */}
                {inviteRequired && (
                  <div className="space-y-1">
                    <label className="text-xs text-stone-400">Código de invitación</label>
                    <input
                      value={formData.inviteCode}
                      onChange={(e) => updateFormData('inviteCode', e.target.value)}
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

                <button
                  disabled={disableSubmit}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Continuar
                </button>

                <Link
                  href="/forgot-password"
                  className="block w-full text-center text-xs text-stone-400 hover:text-stone-200"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </form>
            )}

            {/* Google OAuth - Mostrar en ambas pestañas */}
            <div className="mt-4">
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
                  setGoogleLoading(true);
                  setErr(null);
                  try {
                    await signIn.social({ provider: 'google' });
                  } catch (error: any) {
                    console.error('Google sign-in failed:', error);
                    showError('Error al iniciar sesión con Google');
                  } finally {
                    setGoogleLoading(false);
                  }
                }}
                disabled={googleLoading || loading}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-stone-700 bg-stone-800 py-2 text-sm font-medium text-stone-100 hover:bg-stone-700 disabled:opacity-60"
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
