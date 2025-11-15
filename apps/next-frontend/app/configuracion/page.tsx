'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWalletStatus, useLinkWallet, useUnlinkWallet } from '@/hooks/use-wallet';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function ConfiguracionPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();
  const { data, isLoading, error } = useWalletStatus();
  const linkWallet = useLinkWallet();
  const unlinkWallet = useUnlinkWallet();
  const searchParams = useSearchParams();
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!sessionLoading && !session && mounted) {
      router.push('/sign-in');
    }
  }, [session, sessionLoading, router, mounted]);

  useEffect(() => {
    const success = searchParams.get('success');
    const errorParam = searchParams.get('error');

    if (success === 'wallet_linked') {
      setNotification({
        type: 'success',
        message: '¡Billetera vinculada exitosamente! Ya puedes recibir pagos.',
      });
    } else if (errorParam) {
      let errorMessage = 'Error al vincular la billetera';
      switch (errorParam) {
        case 'oauth_error':
          errorMessage = 'Error en el proceso de autorización de Mercado Pago';
          break;
        case 'missing_params':
          errorMessage = 'Parámetros faltantes en la respuesta de Mercado Pago';
          break;
        case 'invalid_state':
          errorMessage = 'Estado de seguridad inválido';
          break;
        case 'token_error':
          errorMessage = 'Error al obtener el token de acceso';
          break;
        case 'callback_error':
          errorMessage = 'Error en el proceso de vinculación';
          break;
      }
      setNotification({
        type: 'error',
        message: errorMessage,
      });
    }

    if (success || errorParam) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (sessionLoading || !mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const linked = data?.wallet_linked;

  return (
    <div className="min-h-screen bg-stone-950 py-8 pt-8">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-stone-100">Configuración</h1>
          <Link href="/" className="text-sm text-stone-400 hover:text-orange-500 transition-colors">
            Volver al inicio
          </Link>
        </div>

        {notification && (
          <div
            className={`mb-6 rounded-md p-4 ${
              notification.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-center">
              {notification.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400 mr-2" />
              )}
              <p
                className={`text-sm font-medium ${
                  notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {notification.message}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Sección de Perfil */}
          <Card>
            <CardHeader>
              <CardTitle>Mi Perfil</CardTitle>
              <CardDescription>Gestiona tu información personal y avatar</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/configuracion/perfil">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">Editar Perfil</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Sección de Billetera */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Configuración de Pagos
              </CardTitle>
              <CardDescription>
                Gestiona tu método de pago y configuración de billetera
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : error ? (
                <div className="text-red-500 py-4">Error al cargar configuración</div>
              ) : (
                <div className="rounded-md border border-stone-700 bg-stone-900 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-stone-300">Proveedor: Mercado Pago</p>
                    {linked ? (
                      <div className="flex items-center text-green-400">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-xs">Vinculado</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-400">
                        <XCircle className="h-4 w-4 mr-1" />
                        <span className="text-xs">No vinculado</span>
                      </div>
                    )}
                  </div>

                  {linked ? (
                    <div className="space-y-3">
                      <p className="text-sm text-stone-400">
                        Tu billetera de Mercado Pago está vinculada y lista para recibir pagos.
                      </p>
                      <Button
                        disabled={unlinkWallet.isPending}
                        onClick={() => unlinkWallet.mutate()}
                        className="bg-stone-700 text-white hover:bg-stone-600"
                      >
                        {unlinkWallet.isPending ? 'Desvinculando...' : 'Desvincular billetera'}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-stone-400">
                        Vincula tu billetera para recibir pagos de tus eventos.
                      </p>
                      <Button
                        disabled={linkWallet.isPending}
                        onClick={() => linkWallet.mutate('mercado_pago')}
                        className="bg-white text-black hover:bg-stone-200 w-full"
                      >
                        {linkWallet.isPending ? 'Vinculando...' : 'Vincular Mercado Pago'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
