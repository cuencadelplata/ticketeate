'use client';
import { useState } from 'react';
import RoleAuthModal from '@/components/role-auth-modal';

export default function SignUpPage() {
  const [open, setOpen] = useState(true);
  return (
    <RoleAuthModal
      open={open}
      onClose={() => setOpen(false)}
      defaultTab="register"
      defaultRole="USUARIO"
    />
  );
}
