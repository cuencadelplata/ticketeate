import { currentUser, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

export default async function AfterAuth() {
  const user = await currentUser();
  if (!user) redirect('/');

  const already =
    (user.publicMetadata.role as string | undefined) ??
    (user.privateMetadata.role as string | undefined);

  if (!already) {
    const email = user.emailAddresses[0]?.emailAddress ?? '';
    const role = (ADMIN_EMAILS.includes(email) ? 'admin' : 'client') as 'admin' | 'client';

    const clerk = await clerkClient();
    await clerk.users.updateUser(user.id, {
      publicMetadata: { role },
    });
  }

  redirect('/eventos');
}
