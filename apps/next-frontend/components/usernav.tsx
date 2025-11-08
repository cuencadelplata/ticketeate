'use client';

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  DropdownSection,
} from '@heroui/react';
import { toast } from 'sonner';
import Image from 'next/image';
import { useSession, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
// server-only currentUser import intentionally omitted in client component

export const PlusIcon = (props: any) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      >
        <path d="M6 12h12" />
        <path d="M12 18V6" />
      </g>
    </svg>
  );
};

export default function UserNav() {
  const { data: session, isPending } = useSession();
  const isAuthenticated = !!session;
  const isLoading = isPending;
  const userRole = (session as any)?.user?.role || (session as any)?.role;
  const isOrganizador = userRole === 'ORGANIZADOR' || userRole === 'COLABORADOR';
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Sesión cerrada exitosamente');
      // Redirigir a la página de inicio después de cerrar sesión
      router.push('/');
      router.refresh();
    } catch (_error) {
      toast.error('Error al cerrar sesión', { description: 'No se pudo cerrar la sesión' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-4">
        <Avatar isBordered className="size-8 animate-pulse" src="" />
      </div>
    );
  }

  if (!isAuthenticated || !session?.user) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 w-full md:w-auto">
      <Dropdown placement="bottom-end" className="w-full md:w-auto">
        <DropdownTrigger>
          <button className="flex items-center gap-2 w-full md:w-auto px-3 py-2 rounded-lg hover:bg-gray-800/50 transition-colors">
            <div className="relative">
              {session?.user.image ? (
                <Image
                  src={session?.user.image}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="size-8 cursor-pointer rounded-full border-2 border-gray-600 object-cover transition-transform hover:scale-105"
                  unoptimized
                />
              ) : null}
              <div
                className={`flex size-8 cursor-pointer items-center justify-center rounded-full border-2 border-gray-600 bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white transition-transform hover:scale-105 ${session?.user.image ? 'hidden' : ''}`}
              >
                {session?.user.name?.[0] || session?.user.email?.[0] || 'U'}
              </div>
            </div>
            <div className="flex flex-col items-start md:hidden">
              <span className="text-sm font-medium text-white">
                {session?.user.name || session?.user.email}
              </span>
              <span className="text-xs text-gray-400">
                {userRole === 'ORGANIZADOR'
                  ? 'Organizador'
                  : userRole === 'COLABORADOR'
                    ? 'Colaborador'
                    : 'Usuario'}
              </span>
            </div>
            <svg
              className="w-4 h-4 text-gray-400 ml-auto md:hidden"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="User menu"
          className="p-2"
          disabledKeys={['profile']}
          itemClasses={{
            base: [
              'rounded-md',
              'text-default-500',
              'transition-opacity',
              'data-[hover=true]:text-foreground',
              'data-[hover=true]:bg-default-100',
              'dark:data-[hover=true]:bg-default-50',
              'data-[selectable=true]:focus:bg-default-50',
              'data-[pressed=true]:opacity-70',
              'data-[focus-visible=true]:ring-default-500',
            ],
          }}
        >
          <DropdownSection showDivider aria-label="Profile & Actions">
            <DropdownItem key="profile" isReadOnly className="h-14 gap-2 opacity-100">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {session?.user.image ? (
                    <Image
                      src={session?.user.image}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="size-8 rounded-full border-2 border-gray-600 object-cover transition-transform hover:scale-105"
                      unoptimized
                    />
                  ) : null}
                  <div
                    className={`flex size-8 items-center justify-center rounded-full border-2 border-gray-600 bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white ${session?.user.image ? 'hidden' : ''}`}
                  >
                    {session?.user.name?.[0] || session?.user.email?.[0] || 'U'}
                  </div>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-medium leading-none text-default-600">
                    {session?.user.name || session?.user.email}
                  </p>
                  <p className="text-xs text-default-500">
                    {userRole === 'ORGANIZADOR'
                      ? 'Organizador'
                      : userRole === 'COLABORADOR'
                        ? 'Colaborador'
                        : 'Usuario'}
                  </p>
                </div>
              </div>
            </DropdownItem>
            <DropdownItem key="dashboard" href="/eventos">
              {isOrganizador ? 'Mis Eventos' : 'Mis Entradas'}
            </DropdownItem>
            {isOrganizador ? (
              <DropdownItem key="settings" href="/configuracion">
                Configuración
              </DropdownItem>
            ) : null}
            {isOrganizador ? (
              <DropdownItem
                key="new_project"
                href="/crear"
                endContent={<PlusIcon className="text-large" />}
              >
                Crear Evento
              </DropdownItem>
            ) : null}
          </DropdownSection>

          <DropdownSection showDivider aria-label="Preferences">
            <DropdownItem key="profile_settings" href="/configuracion/perfil">
              Perfil
            </DropdownItem>
            <DropdownItem key="historial" href="/historial">
              Historial de Compras
            </DropdownItem>
            <DropdownItem key="help_and_feedback">Ayuda y Soporte</DropdownItem>
          </DropdownSection>

          <DropdownSection aria-label="Actions">
            <DropdownItem
              key="logout"
              className="text-danger"
              color="danger"
              onPress={handleSignOut}
            >
              Cerrar Sesión
            </DropdownItem>
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
