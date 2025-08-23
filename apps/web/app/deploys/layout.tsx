import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panel de Deploys - Ticketeate',
  description: 'Panel administrativo para monitorear deploys y logs',
};

export default function DeploysLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
