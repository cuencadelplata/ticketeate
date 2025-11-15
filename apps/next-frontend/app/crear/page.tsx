'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSession } from '@/lib/auth-client';
import AuthModal from '@/components/auth-modal';
import CreateEventForm from '@/components/create-event-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function CrearPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [orgOpen, setOrgOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const role = (session as any)?.user?.role || (session as any)?.role;
  const isOrganizador = role === 'ORGANIZADOR';
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      // Mostrar el modal después de 1 segundo si no hay sesión
      const timer = setTimeout(() => setOpen(true), 1000);
      return () => clearTimeout(timer);
    } else if (session) {
      // Si ya hay sesión, cerrar el modal
      setOpen(false);
      if (!isOrganizador) {
        setOrgOpen(true);
      } else {
        setOrgOpen(false);
      }
    }
  }, [isPending, session, isOrganizador]);

  async function upgradeToOrganizador(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteCode.trim()) {
      toast.error('Ingresa tu código de organizador');
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch('/api/auth/assign-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'ORGANIZADOR', inviteCode }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'No se pudo validar el código');
      }
      toast.success('Rol actualizado a Organizador');
      // refrescar para que el hook de sesión traiga el nuevo rol
      window.location.reload();
    } catch (err: any) {
      toast.error(err?.message || 'Código inválido');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <CreateEventForm />
      <Suspense fallback={null}>
        <AuthModal
          open={open}
          onClose={() => {
            setOpen(false);
            if (!session) {
              router.push('/');
            }
          }}
          defaultTab="register"
          defaultRole="ORGANIZADOR"
        />
      </Suspense>
      {/* Gate para usuarios logueados sin rol de ORGANIZADOR */}
      {session && !isOrganizador && (
        <Dialog open={orgOpen} onOpenChange={setOrgOpen}>
          <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
            <DialogHeader>
              <DialogTitle className="sr-only">Se requiere rol de Organizador</DialogTitle>
            </DialogHeader>
            <div className="px-6 pb-6 pt-4 bg-stone-900 text-stone-100">
              <div className="mb-3">
                <h2 className="text-lg font-semibold">Se requiere rol de Organizador</h2>
                <p className="text-sm text-stone-400">
                  Para crear eventos, necesitas verificar tu código de organizador.
                </p>
              </div>
              <form onSubmit={upgradeToOrganizador} className="space-y-3">
                <div>
                  <label className="text-xs text-stone-400">Código de organizador</label>
                  <input
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="Ingresa tu código"
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm outline-none focus:border-orange-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting || !inviteCode.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Verificar y continuar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrgOpen(false);
                    router.push('/');
                  }}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 py-2 text-sm font-medium text-stone-100 hover:bg-stone-700"
                >
                  Cancelar
                </button>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
