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
import styles from './usernav.module.css';
// server-only currentUser import intentionally omitted in client component
export const PlusIcon = (props: any) => {
  const { alt, className, ...rest } = props;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M6 12h12"/><path d="M12 18V6"/></g></svg>`;
  const src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  const combinedClassName = [styles.plusIcon, className].filter(Boolean).join(' ');

  return (
    <img
      src={src}
      alt={alt ?? 'Plus'}
      className={combinedClassName}
      {...rest}
    />
  );
};

export default function UserNav() {
  const { data: session, isPending } = useSession();
  const isAuthenticated = !!session;
  const isLoading = isPending;

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Sesión cerrada exitosamente');
    } catch (error) {
      // Log the error so the exception is handled and visible in diagnostics
      console.error('Error signing out:', error);
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
    <div className="flex items-center gap-4">
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <div className="relative cursor-pointer">
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
              {session?.user.name?.[0] ||
                session?.user.email?.[0] ||
                'U'}
            </div>
          </div>
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
                    {session?.user.name?.[0] ||
                      session?.user.email?.[0] ||
                      'U'}
                  </div>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-medium leading-none text-default-600">
                    {session?.user.name || session?.user.email}
                  </p>
                  <p className="text-xs text-default-500">
                    {String(session?.user.role) === 'PRODUCER' ? 'Productor' : 'Cliente'}
                  </p>
                </div>
              </div>
            </DropdownItem>
            <DropdownItem key="dashboard" href="/eventos">
              Mis Eventos
            </DropdownItem>
            <DropdownItem key="settings" href="/configuracion">
              Configuración
            </DropdownItem>
            <DropdownItem
              key="new_project"
              href="/crear"
              endContent={<PlusIcon className="text-large" />}
            >
              Crear Evento
            </DropdownItem>
          </DropdownSection>

          <DropdownSection showDivider aria-label="Preferences">
            <DropdownItem key="profile_settings" href="/configuracion/perfil">
              Perfil
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
