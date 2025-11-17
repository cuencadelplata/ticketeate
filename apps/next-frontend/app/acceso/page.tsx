import { SignUpPageContent } from '@/components/sign-up-page-content';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { roleToPath, type AppRole } from '@/lib/role-redirect';

export default async function AccessPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user?.emailVerified) {
    const target = roleToPath(session.user.role as AppRole | undefined);
    redirect(target);
  }

  return <SignUpPageContent />;
}
