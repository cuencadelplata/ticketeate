'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, User, Mail, Calendar, Shield, Check, X } from 'lucide-react';
import AvatarUpload from '@/components/avatar-upload';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ConfiguracionPerfil() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isPending && !session && mounted) {
      router.push('/sign-in');
    }
  }, [session, isPending, router, mounted]);

  useEffect(() => {
    if (session?.user?.name) {
      setNameValue(session.user.name);
    }
  }, [session?.user?.name]);

  const handleSaveName = async () => {
    if (!nameValue.trim()) {
      toast.error('El nombre no puede estar vacío');
      return;
    }

    if (nameValue === session?.user?.name) {
      setIsEditingName(false);
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameValue.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar');
      }

      toast.success('Nombre actualizado correctamente');
      setIsEditingName(false);
      // Recargar sesión
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  if (isPending || !mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const user = session.user;
  const role = (session as any).role || 'USUARIO';

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ORGANIZADOR':
        return 'bg-orange-900/30 text-orange-300';
      case 'COLABORADOR':
        return 'bg-orange-900/30 text-orange-300';
      default:
        return 'bg-stone-800 text-stone-300';
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 py-8 pt-8">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-stone-100">Mi Perfil</h1>
          <Link
            href="/configuracion"
            className="text-sm text-stone-400 hover:text-orange-500 transition-colors"
          >
            Volver a Configuración
          </Link>
        </div>

        <div className="rounded-2xl bg-stone-900 p-8 shadow-lg border border-stone-800">
          <div className="mb-8 border-b border-stone-800 pb-8">
            <AvatarUpload />
          </div>

          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-stone-300">
                  <User className="h-4 w-4 text-orange-500" />
                  Nombre
                </label>
                {isEditingName ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      className="flex-1 rounded-lg border border-orange-500 bg-stone-800 px-4 py-3 text-stone-100 outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Tu nombre"
                      maxLength={255}
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={isSaving}
                      className="rounded-lg bg-green-600 p-3 text-white hover:bg-green-700 disabled:opacity-50 transition-all"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingName(false);
                        setNameValue(user.name || '');
                      }}
                      className="rounded-lg bg-stone-700 p-3 text-white hover:bg-stone-600 transition-all"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsEditingName(true)}
                    className="cursor-pointer rounded-lg border border-stone-700 bg-stone-800 px-4 py-3 text-stone-100 hover:border-orange-500 hover:bg-stone-700/50 transition-all"
                  >
                    {user.name || 'Sin nombre'} (click para editar)
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-stone-300">
                  <Mail className="h-4 w-4 text-orange-500" />
                  Email
                </label>
                <div className="rounded-lg border border-stone-700 bg-stone-800 px-4 py-3 text-stone-100">
                  {user.email}
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-stone-300">
                  <Shield className="h-4 w-4 text-orange-500" />
                  Rol
                </label>
                <div className="rounded-lg border border-stone-700 bg-stone-800 px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getRoleBadgeColor(role)}`}
                  >
                    {role}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-stone-300">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  Miembro desde
                </label>
                <div className="rounded-lg border border-stone-700 bg-stone-800 px-4 py-3 text-stone-100">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'No disponible'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <Link
                href="/forgot-password"
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-orange-700 hover:shadow-md"
              >
                Cambiar contraseña
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg bg-orange-950/20 border border-orange-900 p-4 text-sm text-orange-200">
          <p className="font-medium">💡 Tip:</p>
          <p className="mt-1">
            Mantén tu perfil actualizado para una mejor experiencia en Ticketeate.
          </p>
        </div>
      </div>
    </div>
  );
}
