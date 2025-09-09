'use client';

import { useWalletStatus, useLinkWallet, useUnlinkWallet } from '@/hooks/use-wallet';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const { data, isLoading, error } = useWalletStatus();
  const linkWallet = useLinkWallet();
  const unlinkWallet = useUnlinkWallet();

  if (isLoading) return <div className="p-6">Cargando...</div>;
  if (error) return <div className="p-6">Error al cargar configuración</div>;

  const linked = data?.wallet_linked;
  const provider = data?.wallet_provider ?? 'mercado_pago';

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Configuración de pagos</h1>
      <div className="rounded-md border border-stone-700 bg-stone-900 p-4">
        <p className="mb-2 text-sm text-stone-300">Proveedor: Mercado Pago (ponele)</p>
        <p className="mb-4 text-sm text-stone-400">
          Estado: {linked ? 'Vinculado' : 'No vinculado'}
        </p>
        {linked ? (
          <Button
            disabled={unlinkWallet.isPending}
            onClick={() => unlinkWallet.mutate()}
            className="bg-stone-700 text-white hover:bg-stone-600"
          >
            {unlinkWallet.isPending ? 'Desvinculando...' : 'Desvincular billetera'}
          </Button>
        ) : (
          <Button
            disabled={linkWallet.isPending}
            onClick={() => linkWallet.mutate(provider)}
            className="bg-white text-black hover:bg-stone-200"
          >
            {linkWallet.isPending ? 'Vinculando...' : 'Vincular Mercado Pago'}
          </Button>
        )}
      </div>
    </div>
  );
}
