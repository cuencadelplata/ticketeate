'use client';
import { useState } from 'react';
import AuthModal from '@/components/auth-modal';

export default function SignUpPage() {
  const [open, setOpen] = useState(true);
  return <AuthModal open={open} onClose={() => setOpen(false)} defaultTab="register" />;
}
