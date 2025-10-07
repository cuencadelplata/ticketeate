'use client';

import { useWalletStatus, useLinkWallet, useUnlinkWallet } from '@/hooks/use-wallet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, CreditCard, Settings } from 'lucide-react';
import Link from 'next/link';

export default function ConfiguracionPage() {
  const { data, isLoading, error } = useWalletStatus();
  const linkWallet = useLinkWallet();
  const unlinkWallet = useUnlinkWallet();

  if (isLoading) return <div className="p-6">Cargando...</div>;
  if (error) return <div className="p-6">Error al cargar configuración</div>;

  const linked = data?.wallet_linked;
  const provider = data?.wallet_provider ?? 'mercado_pago';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="mt-2 text-gray-600">Gestiona tu cuenta, perfil y configuraciones de pago</p>
        </div>

        <Tabs defaultValue="perfil" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="perfil" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="pagos" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pagos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="perfil" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Gestión de Perfil
                </CardTitle>
                <CardDescription>
                  Administra tu información personal, foto de perfil y configuración de cuenta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Desde aquí puedes gestionar toda tu información personal, incluyendo:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Información personal y foto de perfil</li>
                    <li>Verificación de email</li>
                    <li>Cambio de contraseña</li>
                    <li>Información de la cuenta</li>
                  </ul>
                  <Link href="/configuracion/perfil">
                    <Button className="w-full">
                      <User className="h-4 w-4 mr-2" />
                      Ir a Perfil
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pagos" className="space-y-6">
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
                <div className="rounded-md border border-stone-700 bg-stone-900 p-4">
                  <p className="mb-2 text-sm text-stone-300">Proveedor: Mercado Pago</p>
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
