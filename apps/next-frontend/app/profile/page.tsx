'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, User, Mail, Calendar, Shield } from 'lucide-react';
import AvatarUpload from '@/components/avatar-upload';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isPending && !session && mounted) {
      router.push('/sign-in');
    }
  }, [session, isPending, router, mounted]);

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
        return 'bg-purple-100 text-purple-700';
      case 'COLABORADOR':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Volver al inicio
          </Link>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          {/* Avatar Section */}
          <div className="mb-8 border-b border-gray-200 pb-8">
            <AvatarUpload />
          </div>

          {/* User Info */}
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="h-4 w-4" />
                  Nombre
                </label>
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900">
                  {user.name || 'Sin nombre'}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900">
                  {user.email}
                </div>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Shield className="h-4 w-4" />
                  Rol
                </label>
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getRoleBadgeColor(role)}`}
                  >
                    {role}
                  </span>
                </div>
              </div>

              {/* Created At */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4" />
                  Miembro desde
                </label>
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900">
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

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4">
              <Link
                href="/forgot-password"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Cambiar contraseña
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
          <p className="font-medium">💡 Tip:</p>
          <p className="mt-1">
            Mantén tu perfil actualizado para una mejor experiencia en Ticketeate.
          </p>
        </div>
      </div>
    </div>
  );
}
