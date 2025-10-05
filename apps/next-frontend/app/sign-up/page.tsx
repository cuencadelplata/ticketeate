'use client';
import * as React from 'react';
import AuthModal from '@/components/auth-modal';

export default function SignUpPage() {
  const [open, setOpen] = React.useState(true);
  return <AuthModal open={open} onClose={() => setOpen(false)} defaultTab="register" />;
}
