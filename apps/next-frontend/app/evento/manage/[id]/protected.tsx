'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  if (isPending) return null;

  if (!session) {
    const back = encodeURIComponent(pathname ?? '/');
    router.push(`/sign-in?redirect_url=${back}`);
    return null;
  }

  return <>{children}</>;
}
