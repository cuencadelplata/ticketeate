'use client';

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  User,
  DropdownSection,
} from '@heroui/react';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/use-auth';
import { useClerk } from '@clerk/nextjs';

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
  const { user, isSignedIn, isLoading } = useAuth();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Sesión cerrada exitosamente');
    } catch (error) {
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

  if (!isSignedIn || !user) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Avatar
            isBordered
            as="button"
            className="size-8 transition-transform"
            src={
              user.imageUrl || 'https://i.pravatar.cc/150?u=' + user.emailAddresses[0]?.emailAddress
            }
          />
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
              <User
                avatarProps={{
                  size: 'sm',
                  src:
                    user.imageUrl ||
                    'https://i.pravatar.cc/150?u=' + user.emailAddresses[0]?.emailAddress,
                }}
                classNames={{
                  name: 'text-default-600',
                  description: 'text-default-500',
                }}
                description={user.publicMetadata?.role === 'PRODUCER' ? 'Productor' : 'Cliente'}
                name={user.fullName || user.emailAddresses[0]?.emailAddress}
              />
            </DropdownItem>
            <DropdownItem key="dashboard" href="/eventos">
              Mis Eventos
            </DropdownItem>
            <DropdownItem key="settings">Configuración</DropdownItem>
            <DropdownItem
              key="new_project"
              href="/crear"
              endContent={<PlusIcon className="text-large" />}
            >
              Crear Evento
            </DropdownItem>
          </DropdownSection>

          <DropdownSection showDivider aria-label="Preferences">
            <DropdownItem key="profile_settings">Perfil</DropdownItem>
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
