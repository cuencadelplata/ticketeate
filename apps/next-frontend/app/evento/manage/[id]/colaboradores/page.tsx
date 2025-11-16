'use client';

import { use } from 'react';
import { InviteCodesManagement } from '@/components/invite-codes-management';

interface InvitacionesPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function InvitacionesPage({ params }: InvitacionesPageProps) {
  const { id } = use(params);
  return <InviteCodesManagement eventoid={id} />;
}
